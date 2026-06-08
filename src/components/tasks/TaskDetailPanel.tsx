'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Task } from '@/db/dexie';
import { useState, useEffect } from 'react';
import { X, Check, Plus, Trash2, Calendar, Tag, PlayCircle, BookOpen, Briefcase } from 'lucide-react';
import './TaskDetailPanel.css';

import { ChevronRight } from 'lucide-react';

export function TaskDetailPanel({ 
  taskId, 
  onClose,
  onNavigate 
}: { 
  taskId: number; 
  onClose: () => void;
  onNavigate?: (id: number) => void;
}) {
  const task = useLiveQuery(() => db.tasks.get(taskId), [taskId]);
  const parentTask = useLiveQuery(() => task?.parentTaskId ? db.tasks.get(task.parentTaskId) : undefined, [task?.parentTaskId]);
  const actualSubtasks = useLiveQuery(() => db.tasks.where('parentTaskId').equals(taskId).toArray(), [taskId]);
  const workspaces = useLiveQuery(() => db.workspaces.toArray(), []);
  
  // Local states for fast typing before saving to DB
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [newSubtask, setNewSubtask] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [embedInput, setEmbedInput] = useState('');
  
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setTagsInput(task.tags?.join(', ') || '');
      setEmbedInput(task.embedUrl || '');
    }
  }, [task]);

  if (!task) return <div className="task-detail-panel loading">Loading...</div>;

  const handleUpdate = async (updates: Partial<Task>) => {
    try {
      await db.tasks.update(taskId, updates);
    } catch (error) {
      console.error('Error updating task', error);
    }
  };

  const addSubtask = async () => {
    if (!newSubtask.trim()) return;
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      await db.tasks.add({
        workspaceId: task.workspaceId,
        title: newSubtask.trim(),
        description: '',
        status: 'todo',
        priority: 'medium',
        dueDate: todayStr,
        tags: [],
        pomodoroSessions: 0,
        relatedTaskIds: [],
        parentTaskId: taskId
      });
      setNewSubtask('');
    } catch (error: any) {
      console.error('Erro ao adicionar subtarefa:', error);
    }
  };

  const toggleSubtask = async (sub: Task) => {
    if (!sub.id) return;
    const newStatus = sub.status === 'done' ? 'todo' : 'done';
    await db.tasks.update(sub.id, { status: newStatus });
  };

  const deleteSubtask = async (subId: number) => {
    if (confirm('Delete this subtask?')) {
      await db.tasks.delete(subId);
    }
  };

  const updateSubtaskTitle = async (subId: number, newTitle: string) => {
    await db.tasks.update(subId, { title: newTitle });
  };

  return (
    <div className="task-detail-panel">
      {parentTask && (
        <div className="task-breadcrumbs">
          <button className="breadcrumb-link" onClick={() => onNavigate?.(parentTask.id!)}>
            {parentTask.title}
          </button>
          <ChevronRight size={14} className="breadcrumb-sep" />
          <span className="breadcrumb-current">{task.title}</span>
        </div>
      )}
      
      <header className="panel-header">
        <div className="header-actions">
          <select 
            className={`status-badge ${task.status}`} 
            value={task.status}
            onChange={(e) => handleUpdate({ status: e.target.value })}
          >
            <option value="todo">To Do</option>
            <option value="doing">Doing</option>
            <option value="blocked">Blocked</option>
            <option value="done">Done</option>
          </select>
          <select 
            className={`priority-badge priority-${task.priority}`}
            value={task.priority}
            onChange={(e) => handleUpdate({ priority: e.target.value as 'low'|'medium'|'high' })}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div>
          {!task.isPinned && (
            <button 
              className="action-icon-btn delete-task-btn" 
              title="Delete Task"
              onClick={async () => {
                if (confirm('Are you sure you want to delete this task?')) {
                  await db.tasks.delete(taskId);
                  onClose();
                }
              }}
            >
              <Trash2 size={18} />
            </button>
          )}
          <button className="action-icon-btn close-btn" onClick={onClose}><X size={20} /></button>
        </div>
      </header>

      <div className="panel-content">
        <input 
          className="task-title-input" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => handleUpdate({ title })}
          placeholder="Task title..."
        />

        <div className="task-meta-grid">
          <div className="meta-item workspace-picker-wrapper">
            <Briefcase size={16} />
            <select 
              className="workspace-select"
              value={task.workspaceId || ''}
              onChange={(e) => handleUpdate({ workspaceId: e.target.value })}
              style={{ background: 'transparent', border: 'none', color: 'inherit', outline: 'none', width: '100px' }}
            >
              <option value="general">General</option>
              {workspaces?.map(ws => (
                <option key={ws.id} value={String(ws.id)}>{ws.name}</option>
              ))}
            </select>
          </div>
          <div className="meta-item date-picker-wrapper">
            <Calendar size={16} />
            <input 
              type="date" 
              className="date-input"
              value={task.dueDate || ''}
              onChange={(e) => handleUpdate({ dueDate: e.target.value })}
            />
          </div>
          <div className="meta-item tag-input-wrapper">
            <Tag size={16} />
            <input 
              type="text" 
              className="tag-input"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              onBlur={() => handleUpdate({ tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean) })}
              onKeyDown={(e) => e.key === 'Enter' && handleUpdate({ tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean) })}
              placeholder="Add tags (comma separated)"
            />
          </div>
        </div>

        <div className="task-section pomodoro-section">
          <h3>Focus Sessions</h3>
          <div className="pomodoro-counter">
            <button 
              className="pomo-adj-btn" 
              onClick={() => handleUpdate({ pomodoroSessions: Math.max(0, (task.pomodoroSessions || 0) - 1) })}
            >
              -
            </button>
            <span className="pomo-count-display">
              {task.pomodoroSessions || 0} 🍅
            </span>
            <button 
              className="pomo-adj-btn"
              onClick={() => handleUpdate({ pomodoroSessions: (task.pomodoroSessions || 0) + 1 })}
            >
              +
            </button>
          </div>
          <div className="pomodoro-visual-list">
            {Array.from({ length: task.pomodoroSessions || 0 }).map((_, i) => (
              <span key={i} className="pomo-tomato">🍅</span>
            ))}
          </div>
        </div>

        <div className="task-section">
          <h3>Description (Rich Text Base)</h3>
          <textarea 
            className="task-description-editor"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={() => handleUpdate({ description })}
            placeholder="Start writing... (Type [[ to link tasks)"
          />
        </div>

        <div className="task-section subtasks-section">
          <h3>Subtasks</h3>
          <div className="subtasks-list">
            {(actualSubtasks || []).map(sub => (
              <div 
                key={sub.id} 
                className={`subtask-item ${sub.status === 'done' ? 'completed' : ''}`}
              >
                <button className="subtask-check" onClick={() => toggleSubtask(sub)}>
                  {sub.status === 'done' && <Check size={14} />}
                </button>
                <input 
                  className={`subtask-title-input ${sub.status === 'done' ? 'completed' : ''}`}
                  value={sub.title}
                  onChange={(e) => updateSubtaskTitle(sub.id!, e.target.value)}
                />
                <button 
                  className="subtask-navigate" 
                  onClick={() => onNavigate?.(sub.id!)}
                  title="Open Subtask"
                >
                  <BookOpen size={14} />
                </button>
                <button className="subtask-delete" onClick={() => deleteSubtask(sub.id!)}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
          <div className="subtask-input-wrapper">
            <Plus size={16} className="add-icon" />
            <input 
              type="text" 
              placeholder="Add subtask..." 
              value={newSubtask}
              onChange={(e) => setNewSubtask(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addSubtask()}
            />
          </div>
        </div>

        <div className="task-section embed-section">
          <h3>Embeds & Focus</h3>
          <input 
            type="text" 
            className="embed-url-input"
            placeholder="Paste a link (e.g. YouTube) and press Enter..."
            value={embedInput}
            onChange={(e) => setEmbedInput(e.target.value)}
            onBlur={() => handleUpdate({ embedUrl: embedInput })}
            onKeyDown={(e) => e.key === 'Enter' && handleUpdate({ embedUrl: embedInput })}
          />
          {task.embedUrl ? (
            <div className="embed-frame-wrapper">
              <iframe 
                src={task.embedUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')} 
                className="embed-frame" 
                title="Embed Viewer" 
                allowFullScreen
              />
            </div>
          ) : (
            <div className="embed-placeholder">
              <PlayCircle size={32} />
              <p>Paste a link above to watch in Split-Screen</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
