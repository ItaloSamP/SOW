'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/dexie';
import { BarChart2, CheckCircle, Clock, Target } from 'lucide-react';
import './StatsPage.css';

export default function StatsPage() {
  const allTasks = useLiveQuery(() => db.tasks.toArray());

  if (!allTasks) return <div className="stats-container loading">Loading metrics...</div>;

  const completedTasks = allTasks.filter(t => t.status === 'done');
  const totalPomodoros = allTasks.reduce((acc, t) => acc + (t.pomodoroSessions || 0), 0);
  const totalFocusHours = (totalPomodoros * 25) / 60; // Em horas

  // Distribuição de prioridade entre completadas
  const completedHigh = completedTasks.filter(t => t.priority === 'high').length;
  const completedMedium = completedTasks.filter(t => t.priority === 'medium').length;
  const completedLow = completedTasks.filter(t => t.priority === 'low').length;

  return (
    <div className="stats-container">
      <header className="stats-header">
        <h1 className="stats-title">Productivity Stats</h1>
        <p className="stats-subtitle">Your focus and delivery metrics at a glance.</p>
      </header>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon-wrapper success">
            <CheckCircle size={24} />
          </div>
          <div className="metric-info">
            <h3>Completed Tasks</h3>
            <p className="metric-value">{completedTasks.length}</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrapper danger">
            <Target size={24} />
          </div>
          <div className="metric-info">
            <h3>Focus Sessions</h3>
            <p className="metric-value">{totalPomodoros} 🍅</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrapper primary">
            <Clock size={24} />
          </div>
          <div className="metric-info">
            <h3>Hours Focused</h3>
            <p className="metric-value">{totalFocusHours.toFixed(1)}h</p>
          </div>
        </div>
      </div>

      <div className="charts-section">
        <div className="chart-card">
          <h3>Completed by Priority</h3>
          <div className="simple-bar-chart">
            <div className="bar-row">
              <span className="bar-label">High</span>
              <div className="bar-track">
                <div 
                  className="bar-fill priority-high" 
                  style={{ width: `${completedTasks.length ? (completedHigh / completedTasks.length) * 100 : 0}%` }}
                ></div>
              </div>
              <span className="bar-count">{completedHigh}</span>
            </div>
            
            <div className="bar-row">
              <span className="bar-label">Medium</span>
              <div className="bar-track">
                <div 
                  className="bar-fill priority-medium" 
                  style={{ width: `${completedTasks.length ? (completedMedium / completedTasks.length) * 100 : 0}%` }}
                ></div>
              </div>
              <span className="bar-count">{completedMedium}</span>
            </div>

            <div className="bar-row">
              <span className="bar-label">Low</span>
              <div className="bar-track">
                <div 
                  className="bar-fill priority-low" 
                  style={{ width: `${completedTasks.length ? (completedLow / completedTasks.length) * 100 : 0}%` }}
                ></div>
              </div>
              <span className="bar-count">{completedLow}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
