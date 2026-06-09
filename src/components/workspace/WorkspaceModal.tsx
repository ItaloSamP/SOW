'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { db, type Workspace } from '@/db/dexie';
import './WorkspaceModal.css';

interface Props {
  workspace?: Workspace;
  onClose: () => void;
}

const COLORS = ['#00E5FF', '#7C3AED', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#3B82F6'];
const ICONS = ['📁', '💼', '🎓', '🏠', '⚡', '🔬', '🎯', '📚', '🖥️', '🌱'];

export function WorkspaceModal({ workspace, onClose }: Props) {
  const [name, setName] = useState(workspace?.name || '');
  const [type, setType] = useState<'studies' | 'work' | 'personal'>(workspace?.type || 'studies');
  const [icon, setIcon] = useState(workspace?.icon || '📁');
  const [color, setColor] = useState(workspace?.themeColor || '#00E5FF');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      if (workspace?.id) {
        await db.workspaces.update(workspace.id, { name: name.trim(), type, icon, themeColor: color });
      } else {
        await db.workspaces.add({ name: name.trim(), type, icon, themeColor: color, quickLinks: [] });
      }
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!workspace?.id) return;
    if (!confirm(`Delete workspace "${workspace.name}"? Tasks will not be deleted.`)) return;
    await db.workspaces.delete(workspace.id);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <header className="modal-header">
          <h2>{workspace ? 'Edit Workspace' : 'New Workspace'}</h2>
          <button className="modal-close-btn" onClick={onClose}><X size={18} /></button>
        </header>

        <div className="modal-body">
          <label className="modal-label">Name</label>
          <input
            className="modal-input"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            placeholder="Workspace name..."
          />

          <label className="modal-label">Type</label>
          <select className="modal-input" value={type} onChange={(e) => setType(e.target.value as typeof type)}>
            <option value="studies">Studies</option>
            <option value="work">Work</option>
            <option value="personal">Personal</option>
          </select>

          <label className="modal-label">Icon</label>
          <div className="modal-icon-grid">
            {ICONS.map(ic => (
              <button
                key={ic}
                className={`icon-option ${icon === ic ? 'selected' : ''}`}
                onClick={() => setIcon(ic)}
              >
                {ic}
              </button>
            ))}
          </div>

          <label className="modal-label">Color</label>
          <div className="modal-color-grid">
            {COLORS.map(c => (
              <button
                key={c}
                className={`color-swatch ${color === c ? 'selected' : ''}`}
                style={{ background: c }}
                onClick={() => setColor(c)}
              />
            ))}
          </div>
        </div>

        <footer className="modal-footer">
          {workspace && (
            <button className="modal-btn danger" onClick={handleDelete}>Delete</button>
          )}
          <div style={{ flex: 1 }} />
          <button className="modal-btn ghost" onClick={onClose}>Cancel</button>
          <button className="modal-btn primary" onClick={handleSave} disabled={!name.trim() || saving}>
            {saving ? 'Saving...' : workspace ? 'Save' : 'Create'}
          </button>
        </footer>
      </div>
    </div>
  );
}
