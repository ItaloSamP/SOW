'use client';

import { useEffect, useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import imageCompression from 'browser-image-compression';
import { Download, FileText, Paperclip, Upload, X } from 'lucide-react';
import { db, type Attachment } from '@/db/dexie';
import './AttachmentZone.css';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AttachmentZone({ taskId }: { taskId: number }) {
  const attachments = useLiveQuery(
    () => db.attachments.where('taskId').equals(taskId).toArray(),
    [taskId]
  );

  const [isDragOver, setIsDragOver] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<Map<number, string>>(new Map());
  const [lightbox, setLightbox] = useState<Attachment | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);
  // Stable ref so the document-level paste listener always calls the latest saveFiles.
  const saveFilesRef = useRef<(files: File[]) => Promise<void>>(null);
  // Original (pre-compression) sizes for files uploaded this session, keyed by attachment id.
  const originalSizes = useRef<Map<number, number>>(new Map());

  const images = (attachments ?? []).filter((a) => a.type.startsWith('image/'));
  const pdfs = (attachments ?? []).filter((a) => a.type === 'application/pdf');
  const count = attachments?.length ?? 0;

  // Create object URLs for image previews; revoke on change/unmount to avoid leaks.
  useEffect(() => {
    const map = new Map<number, string>();
    for (const img of images) {
      if (img.id != null) map.set(img.id, URL.createObjectURL(img.blob));
    }
    setImageUrls(map);
    return () => {
      for (const url of map.values()) URL.revokeObjectURL(url);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attachments]);

  // Ctrl+V: save images pasted anywhere on the page while this panel is mounted.
  useEffect(() => {
    function handlePaste(e: ClipboardEvent) {
      const items = e.clipboardData?.items;
      if (!items) return;
      const files: File[] = [];
      for (const item of items) {
        if (item.kind === 'file' && item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) files.push(file);
        }
      }
      // No image in the clipboard — let the paste proceed normally (text inputs etc.).
      if (files.length === 0) return;
      e.preventDefault();
      void saveFilesRef.current?.(files);
    }
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, []);

  // Close the lightbox on Esc.
  useEffect(() => {
    if (!lightbox) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setLightbox(null);
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [lightbox]);

  async function saveFiles(files: File[]) {
    setError(null);
    setIsSaving(true);
    const errors: string[] = [];

    for (const file of files) {
      const isImage = file.type.startsWith('image/');
      const isPdf = file.type === 'application/pdf';

      if (!isImage && !isPdf) {
        errors.push(`"${file.name}" is not supported (images and PDFs only).`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`"${file.name}" exceeds the 10MB limit (${formatSize(file.size)}).`);
        continue;
      }

      let blob: Blob = file;
      let type = file.type;
      let name = file.name;

      // Compress images to WebP, except GIFs (keep animations as-is).
      if (isImage && file.type !== 'image/gif') {
        try {
          const compressed = await imageCompression(file, {
            maxWidthOrHeight: 1200,
            initialQuality: 0.8,
            fileType: 'image/webp',
            useWebWorker: true,
          });
          blob = compressed;
          type = 'image/webp';
          name = file.name.replace(/\.[^.]+$/, '') + '.webp';
        } catch {
          // Compression failed — store the original file untouched.
        }
      }

      try {
        const id = await db.attachments.add({
          taskId,
          name,
          type,
          size: blob.size,
          blob,
          createdAt: new Date().toISOString(),
        });
        if (id != null) originalSizes.current.set(id, file.size);
      } catch {
        errors.push(`Failed to save "${file.name}".`);
      }
    }

    if (errors.length > 0) setError(errors.join(' '));
    setIsSaving(false);
  }

  useEffect(() => {
    saveFilesRef.current = saveFiles;
  });

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (files && files.length > 0) void saveFiles(Array.from(files));
    e.target.value = ''; // allow re-selecting the same file
  }

  function handleDragEnter(e: React.DragEvent) {
    e.preventDefault();
    dragDepth.current += 1;
    setIsDragOver(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    dragDepth.current -= 1;
    if (dragDepth.current <= 0) {
      dragDepth.current = 0;
      setIsDragOver(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    dragDepth.current = 0;
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) void saveFiles(files);
  }

  async function removeAttachment(attachment: Attachment) {
    if (attachment.id == null) return;
    if (!window.confirm(`Remove "${attachment.name}"?`)) return;
    originalSizes.current.delete(attachment.id);
    await db.attachments.delete(attachment.id);
  }

  function downloadAttachment(attachment: Attachment) {
    const url = URL.createObjectURL(attachment.blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = attachment.name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  function sizeTooltip(attachment: Attachment): string {
    const original = attachment.id != null ? originalSizes.current.get(attachment.id) : undefined;
    if (original != null && original !== attachment.size) {
      return `${attachment.name} — original ${formatSize(original)} → stored ${formatSize(attachment.size)}`;
    }
    return `${attachment.name} — ${formatSize(attachment.size)}`;
  }

  return (
    <section className="attachment-zone">
      <h3 className="attachment-zone-title">
        <Paperclip size={13} aria-hidden />
        Attachments ({count})
      </h3>

      <div
        className={`attachment-dropzone${isDragOver ? ' attachment-dropzone--over' : ''}`}
        role="button"
        tabIndex={0}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        onDragEnter={handleDragEnter}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload size={18} aria-hidden />
        <span>{isSaving ? 'Saving…' : 'Drop files here or click to upload'}</span>
        <span className="attachment-dropzone-hint">Images and PDFs, up to 10MB each</span>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,application/pdf"
          className="attachment-file-input"
          onChange={handleInputChange}
        />
      </div>

      {error && <p className="attachment-error">{error}</p>}

      {images.length > 0 && (
        <div className="attachment-image-grid">
          {images.map((img) => (
            <figure key={img.id} className="attachment-image-item" title={sizeTooltip(img)}>
              {img.id != null && imageUrls.has(img.id) && (
                <button
                  type="button"
                  className="attachment-image-thumb"
                  aria-label={`View ${img.name}`}
                  onClick={() => setLightbox(img)}
                >
                  <img src={imageUrls.get(img.id)} alt={img.name} loading="lazy" />
                </button>
              )}
              <figcaption className="attachment-image-meta">
                <span className="attachment-image-name">{img.name}</span>
                <span className="attachment-image-size">{formatSize(img.size)}</span>
              </figcaption>
              <button
                type="button"
                className="attachment-remove"
                aria-label={`Remove ${img.name}`}
                onClick={(e) => {
                  e.stopPropagation();
                  void removeAttachment(img);
                }}
              >
                <X size={12} />
              </button>
            </figure>
          ))}
        </div>
      )}

      {pdfs.length > 0 && (
        <ul className="attachment-pdf-list">
          {pdfs.map((pdf) => (
            <li key={pdf.id} className="attachment-pdf-item" title={sizeTooltip(pdf)}>
              <FileText size={16} className="attachment-pdf-icon" aria-hidden />
              <span className="attachment-pdf-name">{pdf.name}</span>
              <span className="attachment-pdf-size">{formatSize(pdf.size)}</span>
              <button
                type="button"
                className="attachment-download"
                aria-label={`Download ${pdf.name}`}
                onClick={() => downloadAttachment(pdf)}
              >
                <Download size={13} />
              </button>
              <button
                type="button"
                className="attachment-remove"
                aria-label={`Remove ${pdf.name}`}
                onClick={() => void removeAttachment(pdf)}
              >
                <X size={12} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {lightbox && lightbox.id != null && imageUrls.has(lightbox.id) && (
        <div
          className="attachment-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={lightbox.name}
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            className="attachment-lightbox-close"
            aria-label="Close preview"
            onClick={() => setLightbox(null)}
          >
            <X size={20} />
          </button>
          <figure
            className="attachment-lightbox-figure"
            onClick={(e) => e.stopPropagation()}
          >
            <img src={imageUrls.get(lightbox.id)} alt={lightbox.name} />
            <figcaption className="attachment-lightbox-caption">
              <span className="attachment-lightbox-name">{lightbox.name}</span>
              <span className="attachment-lightbox-size">{formatSize(lightbox.size)}</span>
            </figcaption>
          </figure>
        </div>
      )}
    </section>
  );
}
