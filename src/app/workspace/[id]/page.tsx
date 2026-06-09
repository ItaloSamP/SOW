'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { KanbanBoard } from '@/components/tasks/KanbanBoard';
import { CalendarView } from '@/components/tasks/CalendarView';
import { TaskDetailPanel } from '@/components/tasks/TaskDetailPanel';
import { QuickAddTask } from '@/components/tasks/QuickAddTask';
import { db } from '@/db/dexie';
import './WorkspacePage.css';

export default function WorkspacePage() {
  const params = useParams();
  const workspaceId = typeof params?.id === 'string' ? params.id : 'all';
  const [activeTab, setActiveTab] = useState<'kanban' | 'calendar'>('kanban');
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
              style={{ fontSize: '2rem', fontWeight: 'bold', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none', borderRadius: '4px', padding: '0 0.5rem' }}
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
        
        <div className="view-toggles">
          <button 
            className={`toggle-btn ${activeTab === 'kanban' ? 'active' : ''}`}
            onClick={() => setActiveTab('kanban')}
          >
            Kanban
          </button>
          <button 
            className={`toggle-btn ${activeTab === 'calendar' ? 'active' : ''}`}
            onClick={() => setActiveTab('calendar')}
          >
            Calendar
          </button>
        </div>
      </header>

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

      <QuickAddTask workspaceId={workspaceId} />

      <div className="workspace-content">
        <div className="main-view">
          {activeTab === 'kanban' ? (
            <KanbanBoard workspaceId={workspaceId} onTaskClick={setSelectedTaskId} searchQuery={searchQuery} />
          ) : (
            <CalendarView workspaceId={workspaceId} onTaskClick={setSelectedTaskId} searchQuery={searchQuery} />
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
