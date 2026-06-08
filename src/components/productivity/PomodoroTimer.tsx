'use client';

import { useState, useEffect } from 'react';
import { Play, Pause, Square, RefreshCcw, Coffee, Focus } from 'lucide-react';
import { db } from '@/db/dexie';
import { useLiveQuery } from 'dexie-react-hooks';
import './PomodoroTimer.css';

const POMODORO_TIME = 25 * 60; // 25 minutes
const SHORT_BREAK_TIME = 5 * 60; // 5 minutes

export function PomodoroTimer() {
  const [timeLeft, setTimeLeft] = useState(POMODORO_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<'focus' | 'break'>('focus');
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);

  const activeTasks = useLiveQuery(
    () => db.tasks.where('status').anyOf('todo', 'doing').toArray()
  );

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      setIsRunning(false);
      handleComplete();
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const handleComplete = async () => {
    // Play sound logic could go here
    if (mode === 'focus' && selectedTaskId) {
      try {
        const task = await db.tasks.get(selectedTaskId);
        if (task) {
          await db.tasks.update(selectedTaskId, {
            pomodoroSessions: (task.pomodoroSessions || 0) + 1
          });
        }
      } catch (err) {
        console.error('Failed to increment pomodoro', err);
      }
    }
    
    // Auto-switch mode
    if (mode === 'focus') {
      setMode('break');
      setTimeLeft(SHORT_BREAK_TIME);
    } else {
      setMode('focus');
      setTimeLeft(POMODORO_TIME);
    }
  };

  const toggleTimer = () => setIsRunning(!isRunning);
  
  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(mode === 'focus' ? POMODORO_TIME : SHORT_BREAK_TIME);
  };

  const switchMode = (newMode: 'focus' | 'break') => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(newMode === 'focus' ? POMODORO_TIME : SHORT_BREAK_TIME);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className={`pomodoro-widget ${mode} ${isRunning ? 'running' : ''}`}>
      <div className="pomodoro-header">
        <div className="mode-switches">
          <button 
            className={`mode-btn ${mode === 'focus' ? 'active' : ''}`}
            onClick={() => switchMode('focus')}
            title="Focus (25m)"
          >
            <Focus size={14} />
          </button>
          <button 
            className={`mode-btn ${mode === 'break' ? 'active' : ''}`}
            onClick={() => switchMode('break')}
            title="Break (5m)"
          >
            <Coffee size={14} />
          </button>
        </div>
        <div className="pomodoro-time">{formatTime(timeLeft)}</div>
      </div>

      {mode === 'focus' && (
        <select 
          className="pomodoro-task-select"
          value={selectedTaskId || ''}
          onChange={(e) => setSelectedTaskId(e.target.value ? Number(e.target.value) : null)}
          disabled={isRunning}
        >
          <option value="">No task selected</option>
          {activeTasks?.map(t => (
            <option key={t.id} value={t.id}>{t.title}</option>
          ))}
        </select>
      )}

      <div className="pomodoro-controls">
        <button className="ctrl-btn play-btn" onClick={toggleTimer}>
          {isRunning ? <Pause size={16} /> : <Play size={16} />}
        </button>
        <button className="ctrl-btn" onClick={resetTimer}>
          <Square size={14} />
        </button>
      </div>
    </div>
  );
}
