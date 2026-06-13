'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { Layers, CalendarClock, GraduationCap } from 'lucide-react';
import { db } from '@/db/dexie';
import './FlashcardsView.css';

interface DeckRow {
  deckId: number;
  deckTitle: string;
  taskTitle: string;
  reviewed: number;
  total: number;
  nextReview: Date | null;
}

function formatDate(date: Date | null): string {
  if (!date || isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function FlashcardsView({ workspaceId }: { workspaceId: string }) {
  const rows = useLiveQuery(async (): Promise<DeckRow[]> => {
    const tasks = await db.tasks.where('workspaceId').equals(workspaceId).toArray();
    if (tasks.length === 0) return [];

    const taskById = new Map(tasks.map(t => [t.id as number, t]));
    const taskIds = tasks.map(t => t.id as number);

    const decks = await db.flashcardDecks.where('taskId').anyOf(taskIds).toArray();

    return Promise.all(
      decks.map(async (deck): Promise<DeckRow> => {
        const cards = await db.flashcards.where('deckId').equals(deck.id as number).toArray();
        const reviewed = cards.filter(c => c.repetitions > 0).length;

        let nextReview: Date | null = null;
        for (const card of cards) {
          const d = new Date(card.nextReviewDate);
          if (!isNaN(d.getTime()) && (nextReview === null || d < nextReview)) {
            nextReview = d;
          }
        }

        return {
          deckId: deck.id as number,
          deckTitle: deck.title,
          taskTitle: deck.taskId !== undefined ? (taskById.get(deck.taskId)?.title ?? '') : '',
          reviewed,
          total: cards.length,
          nextReview,
        };
      })
    );
  }, [workspaceId]);

  if (rows === undefined) return null;

  if (rows.length === 0) {
    return (
      <div className="flashcards-view">
        <div className="flashcards-empty">
          <GraduationCap size={36} className="flashcards-empty-icon" aria-hidden="true" />
          <p className="flashcards-empty-title">No flashcard decks yet</p>
          <p className="flashcards-empty-hint">
            Decks are created from tasks in this workspace, so they&apos;ll show up
            here as your tasks gain flashcards. Full flashcard management
            (creating, editing and reviewing cards) arrives in Phase 3.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flashcards-view">
      <div className="flashcards-list">
        {rows.map(row => (
          <div key={row.deckId} className="flashcard-deck-row">
            <div className="deck-info">
              <span className="deck-name">
                <Layers size={14} />
                {row.deckTitle}
              </span>
              {row.taskTitle && <span className="deck-task">linked to: {row.taskTitle}</span>}
            </div>
            <div className="deck-meta">
              <span className="deck-progress">{row.reviewed}/{row.total} cards reviewed</span>
              <span className="deck-next-review">
                <CalendarClock size={13} />
                next review: {formatDate(row.nextReview)}
              </span>
              <button
                className="deck-open-btn"
                disabled
                title="Coming in Phase 3"
              >
                Open deck
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
