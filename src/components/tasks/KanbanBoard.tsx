'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Task } from '@/db/dexie';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import './KanbanBoard.css';
import { useEffect, useState } from 'react';

// Colunas padrão (futuramente virão do Workspace)
const DEFAULT_COLUMNS = [
  { id: 'todo', title: 'To Do' },
  { id: 'doing', title: 'Doing' },
  { id: 'blocked', title: 'Blocked' },
  { id: 'done', title: 'Done' }
];

export function KanbanBoard({ 
  workspaceId, 
  onTaskClick,
  searchQuery = ''
}: { 
  workspaceId: string, 
  onTaskClick?: (taskId: number) => void,
  searchQuery?: string
}) {
  // Evitar hidration error do dnd
  const [isBrowser, setIsBrowser] = useState(false);
  useEffect(() => {
    setIsBrowser(true);
  }, []);

  const allTasks = useLiveQuery(
    () => db.tasks.where('workspaceId').equals(workspaceId).toArray(),
    [workspaceId]
  );
  
  const onDragEnd = async (result: DropResult) => {
    const { destination, draggableId } = result;
    
    if (!destination) return; // Drop for a da área válida

    // Se não mudou de lugar
    if (destination.droppableId === result.source.droppableId && destination.index === result.source.index) {
      return;
    }

    try {
      const taskId = parseInt(draggableId, 10);
      const newStatus = destination.droppableId;
      await db.tasks.update(taskId, { status: newStatus });
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
    }
  };

  if (!isBrowser) return null;

  const rootTasks = allTasks?.filter(t => !t.parentTaskId) || [];
  
  const getSubtasks = (parentId: number) => {
    return allTasks?.filter(t => t.parentTaskId === parentId) || [];
  };

  const getTasksByStatus = (status: string) => {
    let filtered = rootTasks.filter(t => t.status === status);
    
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        t.title.toLowerCase().includes(q) || 
        t.description?.toLowerCase().includes(q)
      );
    }

    const weight: Record<string, number> = { high: 3, medium: 2, low: 1 };
    return filtered.sort((a, b) => weight[b.priority] - weight[a.priority]);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="kanban-board">
        {DEFAULT_COLUMNS.map((col) => (
          <div key={col.id} className="kanban-column">
            <h3 className="column-title">{col.title} <span className="task-count">{getTasksByStatus(col.id).length}</span></h3>
            
            <Droppable droppableId={col.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`column-content ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                >
                  {getTasksByStatus(col.id).map((task, index) => (
                    <Draggable key={task.id} draggableId={String(task.id)} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`task-card ${snapshot.isDragging ? 'dragging' : ''} priority-${task.priority}`}
                          style={{
                            ...provided.draggableProps.style,
                          }}
                          onClick={() => task.id && onTaskClick?.(task.id)}
                        >
                          <div className="task-header">
                            <h4>{task.title}</h4>
                          </div>
                          {task.description && <p className="task-desc">{task.description}</p>}
                          
                          {task.links?.filter(l => l.isPinned).map((link, idx) => (
                            <a 
                              key={`link-${idx}`} 
                              href={link.url} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="task-card-pinned-link"
                              onClick={(e) => e.stopPropagation()} // Prevent opening task detail when clicking link
                            >
                              {link.title || link.url}
                            </a>
                          ))}

                          {task.tags && task.tags.length > 0 && (
                            <div className="task-card-tags">
                              {task.tags.map((tag, i) => (
                                <span key={i} className="task-card-tag">{tag}</span>
                              ))}
                            </div>
                          )}
                          
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
                                    onClick={(e) => { e.stopPropagation(); onTaskClick?.(sub.id!); }}
                                  >
                                    <span className={`status-dot ${sub.status}`}></span>
                                    {sub.title}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}
