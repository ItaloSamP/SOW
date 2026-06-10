'use client';

import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { db } from '@/db/dexie';
import { useLiveQuery } from 'dexie-react-hooks';
import './PomodoroTimer.css';

const FOCUS_TIME = 25 * 60;
const BREAK_TIME = 5 * 60;

const RING_R = 30;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_R;

export function PomodoroTimer() {
  const [timeLeft, setTimeLeft] = useState(FOCUS_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<'focus' | 'break'>('focus');
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);

  const activeTasks = useLiveQuery(
    () => db.tasks.where('status').anyOf('todo', 'doing').toArray()
  );

  useEffect(() => {
    if (!isRunning) return;
    if (timeLeft === 0) {
      setIsRunning(false);
      handleComplete();
      return;
    }
    const id = setInterval(() => setTimeLeft(p => p - 1), 1000);
    return () => clearInterval(id);
  }, [isRunning, timeLeft]);

  const handleComplete = async () => {
    if (mode === 'focus' && selectedTaskId) {
      try {
        const task = await db.tasks.get(selectedTaskId);
        if (task) await db.tasks.update(selectedTaskId, { pomodoroSessions: (task.pomodoroSessions || 0) + 1 });
      } catch (err) {
        console.error('Failed to increment pomodoro', err);
      }
    }
    if (mode === 'focus') { setMode('break'); setTimeLeft(BREAK_TIME); }
    else { setMode('focus'); setTimeLeft(FOCUS_TIME); }
  };

  const switchMode = (m: 'focus' | 'break') => {
    setIsRunning(false);
    setMode(m);
    setTimeLeft(m === 'focus' ? FOCUS_TIME : BREAK_TIME);
  };

  const reset = () => {
    setIsRunning(false);
    setTimeLeft(mode === 'focus' ? FOCUS_TIME : BREAK_TIME);
  };

  const fmt = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const totalTime = mode === 'focus' ? FOCUS_TIME : BREAK_TIME;
  const dashOffset = RING_CIRCUMFERENCE * (1 - timeLeft / totalTime);

  return (
    <div className="pomo-widget">
      {/* Mode tabs */}
      <div className="pomo-tabs">
        <button
          className={`pomo-tab ${mode === 'focus' ? 'active focus' : ''}`}
          onClick={() => switchMode('focus')}
        >
          Focus
        </button>
        <button
          className={`pomo-tab ${mode === 'break' ? 'active break' : ''}`}
          onClick={() => switchMode('break')}
        >
          Break
        </button>
      </div>

      {/* Ring */}
      <div className="pomo-ring-wrap">
        <svg width="72" height="72" className="pomo-ring-svg">
          <circle cx="36" cy="36" r={RING_R} className="ring-track" />
          <circle
            cx="36" cy="36" r={RING_R}
            className={`ring-fill ring-fill-${mode}`}
            strokeDasharray={RING_CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
          />
        </svg>
        <span className="pomo-time">{fmt(timeLeft)}</span>
      </div>

      {/* Controls */}
      <div className="pomo-controls">
        <button className={`pomo-btn pomo-play pomo-play-${mode}`} onClick={() => setIsRunning(r => !r)}>
          {isRunning ? <Pause size={15} /> : <Play size={15} />}
        </button>
        <button className="pomo-btn pomo-reset" onClick={reset}>
          <RotateCcw size={13} />
        </button>
      </div>

      {/* Task select — focus only */}
      {mode === 'focus' && (
        <select
          className="pomo-task-select"
          value={selectedTaskId || ''}
          onChange={(e) => setSelectedTaskId(e.target.value ? Number(e.target.value) : null)}
          disabled={isRunning}
        >
          <option value="">No task linked</option>
          {activeTasks?.map(t => (
            <option key={t.id} value={t.id}>{t.title}</option>
          ))}
        </select>
      )}
    </div>
  );
}
