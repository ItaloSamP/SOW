'use client';

import { useState } from 'react';
import { ExternalLink, Pencil, X } from 'lucide-react';
import { db, type Workspace } from '@/db/dexie';
import './WorkspaceQuickLinks.css';

export function WorkspaceQuickLinks({ workspace }: { workspace: Workspace }) {
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');

  const links = workspace.quickLinks ?? [];

  const handleAdd = async () => {
    const url = newUrl.trim();
    if (!url || workspace.id === undefined) return;
    const normalizedUrl = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    const link = { title: newTitle.trim() || url, url: normalizedUrl, icon: '' };
    await db.workspaces.update(workspace.id, { quickLinks: [...links, link] });
    setNewTitle('');
    setNewUrl('');
  };

  const handleRemove = async (index: number) => {
    if (workspace.id === undefined) return;
    await db.workspaces.update(workspace.id, {
      quickLinks: links.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="quick-links">
      <div className="quick-links-pills">
        {links.map((link, i) => (
          <span key={`${link.url}-${i}`} className="quick-link-pill">
            <a href={link.url} target="_blank" rel="noreferrer" title={link.url}>
              <ExternalLink size={12} />
              {link.title}
            </a>
            {isEditing && (
              <button
                className="quick-link-remove"
                onClick={() => handleRemove(i)}
                title="Remove link"
              >
                <X size={11} />
              </button>
            )}
          </span>
        ))}
        <button
          className={`quick-links-edit-btn ${isEditing ? 'active' : ''}`}
          onClick={() => setIsEditing(prev => !prev)}
          title={isEditing ? 'Done editing links' : 'Edit quick links'}
        >
          <Pencil size={13} />
        </button>
      </div>

      {isEditing && (
        <div className="quick-links-form">
          <input
            type="text"
            placeholder="Title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <input
            type="text"
            placeholder="https://..."
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
        </div>
      )}
    </div>
  );
}
