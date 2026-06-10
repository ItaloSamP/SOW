'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Task } from '@/db/dexie';
import Link from 'next/link';
import { useState } from 'react';
import { Calendar, Pin, PinOff, Link2 } from 'lucide-react';
import { TaskDetailPanel } from '@/components/tasks/TaskDetailPanel';
import './OverviewPage.css';

export default function Home() {
  const allTasks = useLiveQuery(() => db.tasks.toArray());
  const workspaces = useLiveQuery(() => db.workspaces.toArray());
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const getWorkspaceName = (wsId: string) => {
    if (wsId === 'general') return 'General';
    const numId = parseInt(wsId, 10);
    if (!isNaN(numId)) {
      const ws = workspaces?.find(w => w.id === numId);
      return ws ? ws.name : wsId;
    }
    return wsId;
  };

  const handleCreateTask = async () => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const newId = await db.tasks.add({
        workspaceId: 'general', // Workspace padrão para o overview
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

  // Ordena globalmente por status e prioridade (Flags e Prioridades)
  // Filtra as subtarefas para que não apareçam soltas na Visão Geral
  let rootTasks = allTasks?.filter(t => !t.parentTaskId) || [];
  
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    rootTasks = rootTasks.filter(t => 
      t.title.toLowerCase().includes(q) || 
      (t.description && t.description.toLowerCase().includes(q)) ||
      (t.workspaceId && t.workspaceId.toLowerCase().includes(q))
    );
  }

  const sortedTasks = rootTasks.sort((a, b) => {
    const priorityWeight: Record<string, number> = { high: 3, medium: 2, low: 1 };
    const statusWeight: Record<string, number> = { doing: 3, blocked: 2, todo: 1, done: 0 };
    
    if (statusWeight[b.status] !== statusWeight[a.status]) {
      return statusWeight[b.status] - statusWeight[a.status];
    }
    return priorityWeight[b.priority] - priorityWeight[a.priority];
  });

  const pinnedTasks = sortedTasks?.filter(t => t.isPinned) || [];
  const regularTasks = sortedTasks?.filter(t => !t.isPinned) || [];

  const getSubtasks = (parentId: number) => {
    return allTasks?.filter(t => t.parentTaskId === parentId) || [];
  };

  // Agrupamento por ambiente
  const tasksByWorkspace = regularTasks.reduce((acc, task) => {
    const ws = task.workspaceId;
    if (!acc[ws]) acc[ws] = [];
    acc[ws].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  const togglePin = async (e: React.MouseEvent, task: Task) => {
    e.preventDefault();
    if (task.id) {
      await db.tasks.update(task.id, { isPinned: !task.isPinned });
    }
  };

  const renderTaskCard = (task: Task) => (
    <div key={task.id} className={`overview-task-row ${task.isPinned ? 'pinned' : ''}`}>
      <div className={`row-priority-indicator priority-${task.priority}`}></div>
      
      <div className="row-main-content">
        <div className="row-title-area">
          <h3>{task.title}</h3>
          {task.tags && task.tags.length > 0 && (
            <div className="row-tags">
              {task.tags.map((tag, i) => (
                <span key={i} className="task-card-tag">{tag}</span>
              ))}
            </div>
          )}
        </div>
        {task.description && <p className="row-desc">{task.description}</p>}
        
        {task.links?.filter(l => l.isPinned).map((link, idx) => (
          <a 
            key={`link-${idx}`} 
            href={link.url} 
            target="_blank" 
            rel="noreferrer" 
            className="task-card-pinned-link"
            onClick={(e) => e.stopPropagation()}
            style={{ marginTop: '0.25rem', width: 'fit-content' }}
          >
            <Link2 size={11} /> {link.title || link.url}
          </a>
        ))}
      </div>

      <div className="row-meta">
        {task.dueDate && (
          <span className="row-date"><Calendar size={14} /> {task.dueDate}</span>
        )}
        <span className="workspace-badge">{getWorkspaceName(task.workspaceId)}</span>
        <span className={`status-badge ${task.status}`}>{task.status}</span>
      </div>

      <div className="row-actions">
        <button 
          className={`pin-btn ${task.isPinned ? 'active' : ''}`}
          onClick={(e) => togglePin(e, task)}
          title={task.isPinned ? "Unpin" : "Pin task"}
        >
          {task.isPinned ? <PinOff size={16} /> : <Pin size={16} />}
        </button>
        <button 
          className="row-open-link"
          onClick={(e) => {
            e.preventDefault();
            if (task.id) setSelectedTaskId(task.id);
          }}
        >
          Open
        </button>
        {!task.isPinned && (
          <button 
            className="delete-quick-btn"
            onClick={async (e) => {
              e.preventDefault();
              if (task.id && confirm('Are you sure you want to delete this task?')) {
                await db.tasks.delete(task.id);
              }
            }}
            title="Delete"
          >
            X
          </button>
        )}
      </div>

      <div className="task-hover-popover">
        <h4 className="popover-title">{task.title}</h4>
        <p className="popover-desc">{task.description || 'No description.'}</p>
        
        {getSubtasks(task.id!).length > 0 && (
          <div className="popover-subtasks">
            <span className="popover-subtitle">Subtasks:</span>
            {getSubtasks(task.id!).map(sub => (
              <div 
                key={sub.id} 
                className="popover-subtask-item"
                onClick={(e) => { e.stopPropagation(); setSelectedTaskId(sub.id!); }}
              >
                <span className={`status-dot ${sub.status}`}></span>
                {sub.title}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="overview-container">
      <header className="overview-header">
        <div>
          <h1 className="overview-title">Overview</h1>
          <p className="overview-subtitle">
            Welcome to SOW. Here are all your active tasks.
          </p>
        </div>
      </header>

      <div className="overview-toolbar">
        <div className="search-bar">
          <input 
            type="text" 
            placeholder="Search all tasks..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="new-task-btn" onClick={handleCreateTask}>
          + New Task
        </button>
      </div>
      
      <div className="overview-split-layout">
        <div className="overview-main-view">
          {pinnedTasks.length > 0 && (
            <div className="pinned-section">
              <h2 className="section-title"><Pin size={14} /> Pinned Tasks</h2>
              <div className="tasks-grid">
                {pinnedTasks.map(renderTaskCard)}
              </div>
            </div>
          )}

          <div className="workspaces-section">
            {Object.keys(tasksByWorkspace).length === 0 ? (
              <p className="empty-state">You have no tasks matching your criteria.</p>
            ) : (
              Object.keys(tasksByWorkspace).map(ws => (
                <div key={ws} className="workspace-group">
                  <h2 className="section-title workspace-group-title">
                    Workspace: <span className="highlight-ws">{getWorkspaceName(ws)}</span>
                  </h2>
                  <div className="tasks-grid">
                    {tasksByWorkspace[ws].map(renderTaskCard)}
                  </div>
                </div>
              ))
            )}
          </div>
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
