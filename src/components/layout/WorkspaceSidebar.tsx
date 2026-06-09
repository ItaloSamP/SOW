'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useOrphanRepair } from '@/hooks/useOrphanRepair';
import { db, type Workspace } from '@/db/dexie';
import { LayoutDashboard, Briefcase, GraduationCap, User, Plus, Settings, BarChart2 } from 'lucide-react';
import { PomodoroTimer } from '@/components/productivity/PomodoroTimer';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { WorkspaceModal } from '@/components/workspace/WorkspaceModal';
import './WorkspaceSidebar.css';

export function WorkspaceSidebar() {
  const pathname = usePathname();
  const workspaces = useLiveQuery(() => db.workspaces.toArray());
  useOrphanRepair();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingWs, setEditingWs] = useState<Workspace | undefined>(undefined);

  const openCreate = () => { setEditingWs(undefined); setModalOpen(true); };
  const openEdit = (ws: Workspace, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingWs(ws);
    setModalOpen(true);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'work': return <Briefcase size={18} />;
      case 'studies': return <GraduationCap size={18} />;
      case 'personal': return <User size={18} />;
      default: return <Briefcase size={18} />;
    }
  };

  return (
    <>
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">SOW</div>
        </div>

        <nav className="sidebar-nav">
          <Link href="/" className={`nav-item ${pathname === '/' ? 'active' : ''}`}>
            <LayoutDashboard size={18} />
            <span>Overview</span>
          </Link>

          <Link href="/stats" className={`nav-item ${pathname === '/stats' ? 'active' : ''}`}>
            <BarChart2 size={18} />
            <span>Stats & Focus</span>
          </Link>

          <div className="nav-section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Workspaces</span>
            <button
              className="add-btn"
              style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer' }}
              title="Create Workspace"
              onClick={openCreate}
            >
              <Plus size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {workspaces?.map(ws => (
              <div key={ws.id} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Link
                  href={`/workspace/${ws.id}`}
                  className={`nav-item ${pathname === `/workspace/${ws.id}` ? 'active' : ''}`}
                  style={{ flex: 1 }}
                >
                  {ws.icon && ws.icon !== 'folder' ? (
                    <span style={{ fontSize: '1rem' }}>{ws.icon}</span>
                  ) : getIcon(ws.type)}
                  <span>{ws.name}</span>
                </Link>
                <button
                  onClick={(e) => openEdit(ws, e)}
                  title="Edit workspace"
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.2rem 0.3rem', borderRadius: '4px', opacity: 0.6 }}
                  className="ws-edit-btn"
                >
                  ···
                </button>
              </div>
            ))}
          </div>
        </nav>

        <div className="sidebar-footer">
          <PomodoroTimer />
          <ThemeToggle />
          <Link href="/settings" className="nav-item" style={{ marginTop: '0.5rem' }}>
            <Settings size={18} />
            <span>Settings</span>
          </Link>
        </div>
      </aside>

      {modalOpen && (
        <WorkspaceModal
          workspace={editingWs}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}
