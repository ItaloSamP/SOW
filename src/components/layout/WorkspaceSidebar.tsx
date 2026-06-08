'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/dexie';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Briefcase, GraduationCap, User, Plus, Settings, BarChart2 } from 'lucide-react';
import { PomodoroTimer } from '@/components/productivity/PomodoroTimer';
import './WorkspaceSidebar.css';

export function WorkspaceSidebar() {
  const pathname = usePathname();
  const workspaces = useLiveQuery(() => db.workspaces.toArray());

  const getIcon = (type: string) => {
    switch (type) {
      case 'work': return <Briefcase size={18} />;
      case 'studies': return <GraduationCap size={18} />;
      case 'personal': return <User size={18} />;
      default: return <Briefcase size={18} />;
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          SOW
        </div>
      </div>

      <nav className="sidebar-nav">
        <Link 
          href="/" 
          className={`nav-item ${pathname === '/' ? 'active' : ''}`}
        >
          <LayoutDashboard size={18} />
          <span>Overview</span>
        </Link>
        
        <Link 
          href="/stats" 
          className={`nav-item ${pathname === '/stats' ? 'active' : ''}`}
        >
          <BarChart2 size={18} />
          <span>Stats & Focus</span>
        </Link>

        <div className="nav-section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Workspaces</span>
          <button 
            className="add-btn" 
            style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer' }} 
            title="Create Workspace"
            onClick={async () => {
              const name = prompt('Workspace Name:');
              if (name) {
                await db.workspaces.add({
                  name,
                  type: 'studies',
                  icon: 'folder',
                  themeColor: '#00E5FF',
                  quickLinks: []
                });
              }
            }}
          >
            <Plus size={14} />
          </button>
        </div>
          
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {workspaces?.map(ws => (
            <Link 
              key={ws.id} 
              href={`/workspace/${ws.id}`}
              className={`nav-item ${pathname === `/workspace/${ws.id}` ? 'active' : ''}`}
            >
              {getIcon(ws.type)}
              <span>{ws.name}</span>
            </Link>
          ))}
        </div>
      </nav>

      <div className="sidebar-footer">
        <PomodoroTimer />
        <Link href="/settings" className="nav-item" style={{marginTop: '0.5rem'}}>
          <Settings size={18} />
          <span>Settings</span>
        </Link>
      </div>
    </aside>
  );
}
