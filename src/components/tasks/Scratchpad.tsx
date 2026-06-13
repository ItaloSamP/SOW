'use client';

import { useEffect, useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { StickyNote, Plus, X, ListPlus } from 'lucide-react';
import { db, ScratchpadNote } from '@/db/dexie';
import './Scratchpad.css';

const COLORS: ScratchpadNote['color'][] = ['yellow', 'green', 'blue', 'pink', 'purple'];

export function Scratchpad({ taskId }: { taskId: number }) {
  const task = useLiveQuery(() => db.tasks.get(taskId), [taskId]);
  const notes = task?.scratchpad ?? [];

  const storageKey = `scratchpad-open-${taskId}`;
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Restore persisted open state (after mount, to stay SSR-safe).
  useEffect(() => {
    setIsOpen(localStorage.getItem(storageKey) === 'true');
  }, [storageKey]);

  useEffect(() => {
    if (editingId) textareaRef.current?.focus();
  }, [editingId]);

  const persist = (scratchpad: ScratchpadNote[]) => {
    void db.tasks.update(taskId, { scratchpad });
  };

  const togglePanel = () => {
    setIsOpen((prev) => {
      const next = !prev;
      localStorage.setItem(storageKey, String(next));
      return next;
    });
  };

  const addNote = () => {
    const note: ScratchpadNote = {
      id: crypto.randomUUID(),
      content: '',
      color: 'yellow',
      createdAt: new Date().toISOString(),
    };
    persist([...notes, note]);
    setEditingId(note.id);
    setDraft('');
  };

  const startEditing = (note: ScratchpadNote) => {
    setEditingId(note.id);
    setDraft(note.content);
  };

  const saveDraft = () => {
    if (!editingId) return;
    persist(notes.map((n) => (n.id === editingId ? { ...n, content: draft } : n)));
    setEditingId(null);
    setDraft('');
  };

  const setColor = (id: string, color: ScratchpadNote['color']) => {
    persist(notes.map((n) => (n.id === id ? { ...n, color } : n)));
  };

  const deleteNote = (id: string) => {
    if (editingId === id) {
      setEditingId(null);
      setDraft('');
    }
    persist(notes.filter((n) => n.id !== id));
  };

  const promoteToSubtask = async (note: ScratchpadNote) => {
    if (!task || !note.content.trim()) return;
    const [firstLine, ...rest] = note.content.trim().split('\n');
    await db.tasks.add({
      workspaceId: task.workspaceId,
      title: firstLine.trim() || 'Note',
      description: rest.join('\n').trim() || '',
      status: 'todo',
      priority: 'medium',
      dueDate: new Date().toISOString().split('T')[0],
      tags: [],
      pomodoroSessions: 0,
      relatedTaskIds: [],
      parentTaskId: taskId,
    });
    if (editingId === note.id) {
      setEditingId(null);
      setDraft('');
    }
    persist(notes.filter((n) => n.id !== note.id));
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination || result.destination.index === result.source.index) return;
    const reordered = [...notes];
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    persist(reordered);
  };

  return (
    <div className="scratchpad">
      <button
        type="button"
        className={`scratchpad-toggle${isOpen ? ' is-open' : ''}`}
        onClick={togglePanel}
        aria-expanded={isOpen}
      >
        <StickyNote size={14} />
        <span>Notes</span>
        {notes.length > 0 && <span className="scratchpad-badge">{notes.length}</span>}
      </button>

      {isOpen && (
        <div className="scratchpad-panel">
          <div className="scratchpad-panel-header">
            <span className="scratchpad-panel-title">Scratchpad</span>
            <button
              type="button"
              className="scratchpad-add"
              onClick={addNote}
              aria-label="Add note"
              title="Add note"
            >
              <Plus size={14} />
            </button>
          </div>

          {notes.length === 0 ? (
            <p className="scratchpad-empty">No notes yet. Click + to add one.</p>
          ) : (
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId={`scratchpad-${taskId}`}>
                {(provided) => (
                  <div
                    className="scratchpad-grid"
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    {notes.map((note, index) => {
                      const isEditing = editingId === note.id;
                      return (
                        <Draggable key={note.id} draggableId={note.id} index={index}>
                          {(dragProvided, snapshot) => (
                            <div
                              ref={dragProvided.innerRef}
                              {...dragProvided.draggableProps}
                              {...dragProvided.dragHandleProps}
                              className={[
                                'scratchpad-note',
                                `scratchpad-note--${note.color}`,
                                isEditing ? 'is-editing' : '',
                                snapshot.isDragging ? 'is-dragging' : '',
                              ]
                                .filter(Boolean)
                                .join(' ')}
                              onClick={() => {
                                if (!isEditing) startEditing(note);
                              }}
                            >
                              <button
                                type="button"
                                className="scratchpad-note-promote"
                                aria-label="Promote to subtask"
                                title="Promote to subtask"
                                disabled={!note.content.trim()}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  void promoteToSubtask(note);
                                }}
                              >
                                <ListPlus size={11} />
                              </button>
                              <button
                                type="button"
                                className="scratchpad-note-delete"
                                aria-label="Delete note"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNote(note.id);
                                }}
                              >
                                <X size={11} />
                              </button>

                              {isEditing ? (
                                <textarea
                                  ref={textareaRef}
                                  className="scratchpad-note-input"
                                  value={draft}
                                  placeholder="Write a note…"
                                  onChange={(e) => setDraft(e.target.value)}
                                  onBlur={saveDraft}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              ) : (
                                <p className="scratchpad-note-content">
                                  {note.content || <span className="is-placeholder">Empty note</span>}
                                </p>
                              )}

                              {isEditing && (
                                <div className="scratchpad-note-colors">
                                  {COLORS.map((color) => (
                                    <button
                                      key={color}
                                      type="button"
                                      className={`scratchpad-color-dot scratchpad-color-dot--${color}${
                                        note.color === color ? ' is-active' : ''
                                      }`}
                                      aria-label={`Set color ${color}`}
                                      onMouseDown={(e) => e.preventDefault()}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setColor(note.id, color);
                                      }}
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </div>
      )}
    </div>
  );
}
