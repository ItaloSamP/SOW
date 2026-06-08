'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/dexie';
import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import './CalendarView.css';

export function CalendarView({ 
  workspaceId,
  onTaskClick,
  searchQuery = ''
}: { 
  workspaceId: string,
  onTaskClick?: (taskId: number) => void,
  searchQuery?: string
}) {
  const [isBrowser, setIsBrowser] = useState(false);
  useEffect(() => setIsBrowser(true), []);

  const tasks = useLiveQuery(
    () => db.tasks.where('workspaceId').equals(workspaceId).toArray(),
    [workspaceId]
  );
  
  let rootTasks = tasks?.filter(t => !t.parentTaskId) || [];
  
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    rootTasks = rootTasks.filter(t => 
      t.title.toLowerCase().includes(q) || 
      t.description?.toLowerCase().includes(q)
    );
  }

  const [hoveredTask, setHoveredTask] = useState<any | null>(null);

  if (!isBrowser) return null;

  // Gerar um mês genérico de exemplo: Ano-Mês-Dia (Ex: 2026-06-01 até 2026-06-30)
  const currentYear = new Date().getFullYear();
  const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
  
  const datesInMonth = Array.from({ length: 30 }, (_, i) => {
    const day = String(i + 1).padStart(2, '0');
    return `${currentYear}-${currentMonth}-${day}`;
  });

  const getTasksForDate = (dateStr: string) => {
    if (!rootTasks) return [];
    return rootTasks.filter((t) => t.dueDate === dateStr);
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, draggableId } = result;
    if (!destination) return;

    if (destination.droppableId === result.source.droppableId) return;

    try {
      const taskId = parseInt(draggableId, 10);
      const newDate = destination.droppableId;
      await db.tasks.update(taskId, { dueDate: newDate });
    } catch (error) {
      console.error('Erro ao mover tarefa no calendário:', error);
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="calendar-container">
        <div className="calendar-grid">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="calendar-header-day">{d}</div>
          ))}
          
          <div className="calendar-day empty"></div>
          <div className="calendar-day empty"></div>

          {datesInMonth.map((dateStr) => {
            const dayTasks = getTasksForDate(dateStr);
            const dayNumber = parseInt(dateStr.split('-')[2], 10);
            
            return (
              <Droppable key={dateStr} droppableId={dateStr}>
                {(provided, snapshot) => (
                  <div 
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`calendar-day ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                  >
                    <span className="day-number">{dayNumber}</span>
                    <div className="day-tasks">
                      {dayTasks.map((task, index) => (
                        <Draggable key={task.id} draggableId={String(task.id)} index={index}>
                          {(provided, snapshot) => (
                            <div 
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`calendar-task-pill priority-${task.priority} ${snapshot.isDragging ? 'dragging' : ''}`}
                              onMouseEnter={() => setHoveredTask(task)}
                              onMouseLeave={() => setHoveredTask(null)}
                              onClick={() => task.id && onTaskClick?.(task.id)}
                              style={{
                                ...provided.draggableProps.style,
                              }}
                            >
                              {task.title}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            );
          })}
        </div>

        {hoveredTask && (
          <div className="calendar-tooltip glass-effect">
            <h4>{hoveredTask.title}</h4>
            <p>{hoveredTask.description || 'No description.'}</p>
            
            {(() => {
              const subtasks = tasks?.filter(t => t.parentTaskId === hoveredTask.id) || [];
              if (subtasks.length > 0) {
                return (
                  <div className="calendar-tooltip-subtasks">
                    <span className="tooltip-sub-label">Subtasks:</span>
                    {subtasks.map(sub => (
                      <div key={sub.id} className="tooltip-sub-item">
                        <span className={`status-dot ${sub.status}`}></span>
                        {sub.title}
                      </div>
                    ))}
                  </div>
                );
              }
              return null;
            })()}

            <div className="tooltip-meta">
              <span className={`status-badge ${hoveredTask.status}`}>{hoveredTask.status}</span>
              <span>Priority: {hoveredTask.priority}</span>
            </div>
          </div>
        )}
      </div>
    </DragDropContext>
  );
}
