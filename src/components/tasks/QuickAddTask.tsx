'use client';

import { useState, useRef } from 'react';
import { db } from '@/db/dexie';
import { Plus } from 'lucide-react';
import './QuickAddTask.css';

export function QuickAddTask({ workspaceId }: { workspaceId: string }) {
  const [title, setTitle] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      inputRef.current?.focus();
      return;
    }

    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const newId = await db.tasks.add({
        workspaceId: workspaceId,
        title: title.trim(),
        description: '',
        status: 'todo',
        priority: 'medium',
        dueDate: todayStr,
        tags: [],
        pomodoroSessions: 0,
        relatedTaskIds: []
      });
      setTitle('');
    } catch (error: any) {
      console.error('Erro ao adicionar tarefa:', error);
      alert('Erro ao criar tarefa: ' + error.message);
    }
  };

  return (
    <form className="quick-add-form" onSubmit={handleAddTask}>
      <div className="input-wrapper">
        <Plus size={20} className="add-icon" />
        <input
          ref={inputRef}
          type="text"
          className="quick-add-input"
          placeholder="What needs to be done? (Type and press Enter)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <button type="submit" className="quick-add-btn">
        Add Task
      </button>
    </form>
  );
}
