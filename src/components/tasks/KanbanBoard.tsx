'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Task } from '@/db/dexie';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Paperclip } from 'lucide-react';
import './KanbanBoard.css';
import { useEffect, useRef, useState } from 'react';

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
  const [isBrowser, setIsBrowser] = useState(false);
  useEffect(() => { setIsBrowser(true); }, []);

  const allTasks = useLiveQuery(
    () => db.tasks.where('workspaceId').equals(workspaceId).toArray(),
    [workspaceId]
  );

  const attachmentCounts = useLiveQuery(async () => {
    const keys = await db.attachments.orderBy('taskId').keys();
    const counts = new Map<number, number>();
    for (const key of keys) {
      const taskId = key as number;
      counts.set(taskId, (counts.get(taskId) || 0) + 1);
    }
    return counts;
  }, []);

  const [hoveredTask, setHoveredTask] = useState<Task | null>(null);
  const [hoverAnchor, setHoverAnchor] = useState<{ x: number; y: number } | null>(null);
  const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCardMouseEnter = (e: React.MouseEvent, task: Task) => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setHoverAnchor({ x: rect.right + 8, y: rect.top });
    setHoveredTask(task);
  };

  const handleCardMouseLeave = () => {
    hoverTimeout.current = setTimeout(() => setHoveredTask(null), 120);
  };

  const handlePopoverMouseEnter = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
  };

  const handlePopoverMouseLeave = () => {
    setHoveredTask(null);
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === result.source.droppableId && destination.index === result.source.index) return;

    try {
      const taskId = parseInt(draggableId, 10);
      await db.tasks.update(taskId, { status: destination.droppableId });
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
    }
  };

  if (!isBrowser) return null;

  const rootTasks = allTasks?.filter(t => !t.parentTaskId) || [];

  const getSubtasks = (parentId: number) =>
    allTasks?.filter(t => t.parentTaskId === parentId) || [];

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

  const hoveredSubtasks = hoveredTask ? getSubtasks(hoveredTask.id!) : [];

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="kanban-board">
          {DEFAULT_COLUMNS.map((col) => (
            <div key={col.id} className="kanban-column">
              <h3 className="column-title">
                {col.title} <span className="task-count">{getTasksByStatus(col.id).length}</span>
              </h3>

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
                              ...(!task.coverGradient && task.coverColor ? { borderTop: `2px solid ${task.coverColor}` } : {})
                            }}
                            onClick={() => task.id && onTaskClick?.(task.id)}
                            onMouseEnter={(e) => handleCardMouseEnter(e, task)}
                            onMouseLeave={handleCardMouseLeave}
                          >
                            {task.coverGradient && (
                              <div
                                className="task-card-cover-strip"
                                style={{ background: task.coverGradient }}
                              />
                            )}
                            <div className="task-header">
                              <h4>
                                {task.taskIcon && <span className="task-card-icon">{task.taskIcon}</span>}
                                {task.title}
                              </h4>
                            </div>
                            {task.description && <p className="task-desc">{task.description}</p>}

                            {task.links?.filter(l => l.isPinned).map((link, idx) => (
                              <a
                                key={`link-${idx}`}
                                href={link.url}
                                target="_blank"
                                rel="noreferrer"
                                className="task-card-pinned-link"
                                onClick={(e) => e.stopPropagation()}
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

                            {(attachmentCounts?.get(task.id!) ?? 0) > 0 && (
                              <span className="task-card-attachments">
                                <Paperclip size={12} /> {attachmentCounts!.get(task.id!)}
                              </span>
                            )}
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

      {hoveredTask && hoverAnchor && (
        <div
          className="task-hover-popover"
          style={{ left: hoverAnchor.x, top: hoverAnchor.y }}
          onMouseEnter={handlePopoverMouseEnter}
          onMouseLeave={handlePopoverMouseLeave}
        >
          <h4 className="popover-title">{hoveredTask.title}</h4>
          {hoveredTask.description && (
            <p className="popover-desc">{hoveredTask.description}</p>
          )}
          {hoveredSubtasks.length > 0 && (
            <div className="popover-subtasks">
              <span className="popover-subtitle">Subtasks</span>
              {hoveredSubtasks.map(sub => (
                <div
                  key={sub.id}
                  className="popover-subtask-item"
                  onClick={(e) => {
                    e.stopPropagation();
                    setHoveredTask(null);
                    onTaskClick?.(sub.id!);
                  }}
                >
                  <span className={`status-dot ${sub.status}`} />
                  {sub.title}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
