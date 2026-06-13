import Dexie, { type EntityTable } from 'dexie';

export interface WorkspaceColumn {
  id: string;
  title: string;
  order: number;
}

export interface Workspace {
  id?: number;
  name: string;
  type: 'studies' | 'work' | 'personal';
  icon: string;
  themeColor: string;
  quickLinks: Array<{ title: string; url: string; icon: string }>;
  columns?: WorkspaceColumn[];
}

export interface ScratchpadNote {
  id: string;
  content: string;
  color: 'yellow' | 'green' | 'blue' | 'pink' | 'purple';
  createdAt: string; // ISO
}

export interface Task {
  id?: number;
  workspaceId: string;
  title: string;
  description: string;
  tiptapContent?: object; // TipTap JSON document (rich text)
  status: string;
  priority: 'low' | 'medium' | 'high';
  isPinned?: boolean;
  dueDate?: string; // Alterado para string para facilitar com input type="date"
  tags: string[];
  subtasks?: Array<{ id: string; title: string; completed: boolean }>;
  links?: Array<{ title: string; url: string; isPinned: boolean }>;
  embedUrl?: string;
  pomodoroSessions: number;
  parentTaskId?: number;
  relatedTaskIds: number[];
  gitHubIssueNumber?: number;
  scratchpad?: ScratchpadNote[];
  coverColor?: string;     // hex or CSS color token
  coverGradient?: string;  // full CSS gradient string
  taskIcon?: string;       // emoji character
}

export interface Attachment {
  id?: number;
  taskId: number;
  name: string;
  type: string;       // MIME type
  size: number;       // bytes, after compression
  blob: Blob;
  createdAt: string;  // ISO
}

export interface FlashcardDeck {
  id?: number;
  taskId?: number;
  title: string;
  difficulty: 'exam' | 'study' | 'review';
  createdAt: Date;
  scoreHistory: any[];
}

export interface Flashcard {
  id?: number;
  deckId: number;
  question: string;
  options: string[];
  correctOption: string;
  explanation: string;
  imageUrl?: string;
  repetitions: number;
  interval: number;
  easeFactor: number;
  nextReviewDate: Date;
}

export interface PeriodicReport {
  id?: number;
  workspaceId: number;
  periodType: 'daily' | 'weekly' | 'monthly';
  dateString: string;
  rawMetrics: any;
  aiSummary: string;
  userNotes: string;
}

const db = new Dexie('SOWDatabase') as Dexie & {
  workspaces: EntityTable<Workspace, 'id'>;
  tasks: EntityTable<Task, 'id'>;
  flashcardDecks: EntityTable<FlashcardDeck, 'id'>;
  flashcards: EntityTable<Flashcard, 'id'>;
  periodicReports: EntityTable<PeriodicReport, 'id'>;
  attachments: EntityTable<Attachment, 'id'>;
};

db.version(1).stores({
  workspaces: '++id, name, type',
  tasks: '++id, workspaceId, status, priority, dueDate, parentTaskId',
  flashcardDecks: '++id, taskId, difficulty',
  flashcards: '++id, deckId, nextReviewDate',
  periodicReports: '++id, workspaceId, periodType, dateString'
});

// v2: rich text (tiptapContent), scratchpad notes, cover color/gradient and
// emoji icon on Task. All non-indexed fields — same stores, version bump only.
db.version(2).stores({
  workspaces: '++id, name, type',
  tasks: '++id, workspaceId, status, priority, dueDate, parentTaskId',
  flashcardDecks: '++id, taskId, difficulty',
  flashcards: '++id, deckId, nextReviewDate',
  periodicReports: '++id, workspaceId, periodType, dateString'
});

// v3: local file attachments stored as Blobs.
db.version(3).stores({
  attachments: '++id, taskId'
});

/**
 * Deletes a task with all its descendant subtasks (recursively) and the
 * attachments of every deleted task. Prevents orphaned blobs in IndexedDB.
 */
export async function deleteTaskCascade(taskId: number): Promise<void> {
  const idsToDelete: number[] = [taskId];
  let frontier = [taskId];
  while (frontier.length > 0) {
    const children = await db.tasks.where('parentTaskId').anyOf(frontier).toArray();
    frontier = children.map(c => c.id!).filter(Boolean);
    idsToDelete.push(...frontier);
  }
  await db.transaction('rw', db.tasks, db.attachments, async () => {
    await db.attachments.where('taskId').anyOf(idsToDelete).delete();
    await db.tasks.bulkDelete(idsToDelete);
  });
}

export { db };
