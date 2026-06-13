'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { GitBranch } from 'lucide-react';
import { KanbanBoard } from '@/components/tasks/KanbanBoard';
import { CalendarView } from '@/components/tasks/CalendarView';
import { TaskDetailPanel } from '@/components/tasks/TaskDetailPanel';
import { FlashcardsView } from '@/components/workspace/FlashcardsView';
import { WorkspaceQuickLinks } from '@/components/workspace/WorkspaceQuickLinks';
import { db } from '@/db/dexie';
import './WorkspacePage.css';

type WorkspaceTab = 'kanban' | 'calendar' | 'flashcards' | 'github';

const WORKSPACE_TABS: WorkspaceTab[] = ['kanban', 'calendar', 'flashcards', 'github'];

function isWorkspaceTab(value: string): value is WorkspaceTab {
  return (WORKSPACE_TABS as string[]).includes(value);
}

export default function WorkspacePage() {
  const params = useParams();
  const workspaceId = typeof params?.id === 'string' ? params.id : 'all';
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('kanban');
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleCreateTask = async () => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const newId = await db.tasks.add({
        workspaceId: workspaceId,
        title: 'New Task',
        description: '',
        status: 'todo',
        priority: 'medium',
        dueDate: todayStr,
        tags: [],
        pomodoroSessions: 0,
        relatedTaskIds: []
      });
      if (newId !== undefined) {
        setSelectedTaskId(newId as number);
      }
    } catch (err) {
      console.error('Error creating task:', err);
    }
  };

  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');

  const workspace = useLiveQuery(async () => {
    const numId = parseInt(workspaceId, 10);
    if (!isNaN(numId)) {
      return await db.workspaces.get(numId);
    }
    return undefined;
  }, [workspaceId]);

  // Restore the persisted tab for this workspace on mount (SSR-safe:
  // localStorage is only touched inside the effect, never during render).
  // If the restored tab isn't supported by the workspace type, the reset
  // effect below will validate it and fall back to kanban.
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`workspace-view-${workspaceId}`);
      if (stored && isWorkspaceTab(stored)) {
        setActiveTab(stored);
      }
    } catch {
      // localStorage unavailable — keep the default tab.
    }
  }, [workspaceId]);

  const handleTabChange = (tab: WorkspaceTab) => {
    setActiveTab(tab);
    try {
      localStorage.setItem(`workspace-view-${workspaceId}`, tab);
    } catch {
      // localStorage unavailable — tab still switches, just not persisted.
    }
  };

  // Reset to a valid tab if the workspace type doesn't support the active one.
  // This also validates tabs restored from localStorage above.
  useEffect(() => {
    if (
      (activeTab === 'flashcards' && workspace && workspace.type !== 'studies') ||
      (activeTab === 'github' && workspace && workspace.type !== 'work')
    ) {
      setActiveTab('kanban');
      try {
        localStorage.setItem(`workspace-view-${workspaceId}`, 'kanban');
      } catch {
        // localStorage unavailable — ignore.
      }
    }
  }, [activeTab, workspace, workspaceId]);

  const handleRenameWorkspace = async () => {
    if (!workspace?.id || !editedName.trim() || editedName === workspace.name) {
      setIsEditingName(false);
      return;
    }
    await db.workspaces.update(workspace.id, { name: editedName });
    setIsEditingName(false);
  };

  const displayName = workspace?.name || (workspaceId === 'general' ? 'General' : workspaceId);

  return (
    <div className="workspace-container">
      <header className="workspace-header">
        <div>
          {isEditingName ? (
            <input
              autoFocus
              className="workspace-title-input"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              onBlur={handleRenameWorkspace}
              onKeyDown={(e) => e.key === 'Enter' && handleRenameWorkspace()}
            />
          ) : (
            <h1 
              className="workspace-title" 
              style={{ cursor: workspace ? 'pointer' : 'default' }}
              onClick={() => {
                if (workspace) {
                  setEditedName(workspace.name);
                  setIsEditingName(true);
                }
              }}
              title={workspace ? "Click to rename" : ""}
            >
              {displayName}
            </h1>
          )}
          <p className="workspace-subtitle">Manage your tasks and schedule in this context.</p>
        </div>
        
        <div className="header-controls">
          <div className="view-toggles">
            <button
              className={`toggle-btn ${activeTab === 'kanban' ? 'active' : ''}`}
              onClick={() => handleTabChange('kanban')}
            >
              Kanban
            </button>
            <button
              className={`toggle-btn ${activeTab === 'calendar' ? 'active' : ''}`}
              onClick={() => handleTabChange('calendar')}
            >
              Calendar
            </button>
            {workspace?.type === 'studies' && (
              <button
                className={`toggle-btn ${activeTab === 'flashcards' ? 'active' : ''}`}
                onClick={() => handleTabChange('flashcards')}
              >
                Flashcards
              </button>
            )}
            {workspace?.type === 'work' && (
              <button
                className={`toggle-btn ${activeTab === 'github' ? 'active' : ''}`}
                onClick={() => handleTabChange('github')}
              >
                GitHub
              </button>
            )}
          </div>

          {workspace && <WorkspaceQuickLinks workspace={workspace} />}
        </div>
      </header>

      {(activeTab === 'kanban' || activeTab === 'calendar') && (
        <div className="workspace-toolbar">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="new-task-btn" onClick={handleCreateTask}>
            + New Task
          </button>
        </div>
      )}

      <div className="workspace-content">
        <div className="main-view">
          {activeTab === 'kanban' && (
            <KanbanBoard workspaceId={workspaceId} onTaskClick={setSelectedTaskId} searchQuery={searchQuery} />
          )}
          {activeTab === 'calendar' && (
            <CalendarView workspaceId={workspaceId} onTaskClick={setSelectedTaskId} searchQuery={searchQuery} />
          )}
          {activeTab === 'flashcards' && <FlashcardsView workspaceId={workspaceId} />}
          {activeTab === 'github' && (
            <div className="github-placeholder">
              <GitBranch size={32} />
              <p>Connect your GitHub account in Settings &gt; GitHub to see issues and PRs here.</p>
              <Link href="/settings" className="github-settings-link">
                Go to Settings
              </Link>
            </div>
          )}
        </div>
        
        {selectedTaskId && (
          <div className="split-panel">
            <TaskDetailPanel 
              taskId={selectedTaskId} 
              onClose={() => setSelectedTaskId(null)} 
              onNavigate={setSelectedTaskId}
            />
          </div>
        )}
      </div>
    </div>
  );
}
