'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useOrphanRepair } from '@/hooks/useOrphanRepair';
import { db, type Workspace } from '@/db/dexie';
import {
  LayoutDashboard, Briefcase, GraduationCap, User,
  Plus, Settings, BarChart2, MoreHorizontal,
} from 'lucide-react';
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

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'work':     return 'Work workspace';
      case 'studies':  return 'Studies workspace';
      case 'personal': return 'Personal workspace';
      default:         return 'Workspace';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'work':     return <Briefcase size={16} />;
      case 'studies':  return <GraduationCap size={16} />;
      case 'personal': return <User size={16} />;
      default:         return <Briefcase size={16} />;
    }
  };

  return (
    <>
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">SO<span className="logo-accent">W</span></div>
        </div>

        <nav className="sidebar-nav">
          <Link href="/" className={`nav-item ${pathname === '/' ? 'active' : ''}`}>
            <LayoutDashboard size={16} />
            <span>Overview</span>
          </Link>

          <Link href="/stats" className={`nav-item ${pathname === '/stats' ? 'active' : ''}`}>
            <BarChart2 size={16} />
            <span>Stats & Focus</span>
          </Link>

          <div className="nav-section-title">
            <span>Workspaces</span>
            <button className="add-workspace-btn" title="Create workspace" onClick={openCreate}>
              <Plus size={13} />
            </button>
          </div>

          <div className="ws-list">
            {workspaces?.map(ws => (
              <div key={ws.id} className="ws-item-row">
                <Link
                  href={`/workspace/${ws.id}`}
                  className={`nav-item ws-link ${pathname === `/workspace/${ws.id}` ? 'active' : ''}`}
                >
                  <span className="ws-type-icon" title={getTypeLabel(ws.type)}>
                    {ws.icon && ws.icon !== 'folder'
                      ? <span className="ws-emoji">{ws.icon}</span>
                      : getIcon(ws.type)
                    }
                  </span>
                  <span>{ws.name}</span>
                </Link>
                <button
                  onClick={(e) => openEdit(ws, e)}
                  title="Edit workspace"
                  className="ws-edit-btn"
                >
                  <MoreHorizontal size={14} />
                </button>
              </div>
            ))}
          </div>
        </nav>

        <div className="sidebar-footer">
          <PomodoroTimer />
          <ThemeToggle />
          <Link href="/settings" className={`nav-item ${pathname === '/settings' ? 'active' : ''}`}>
            <Settings size={16} />
            <span>Settings</span>
          </Link>
        </div>
      </aside>

      {modalOpen && (
        <WorkspaceModal workspace={editingWs} onClose={() => setModalOpen(false)} />
      )}
    </>
  );
}
