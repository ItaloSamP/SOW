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

export interface Task {
  id?: number;
  workspaceId: string;
  title: string;
  description: string;
  status: string;
  priority: 'low' | 'medium' | 'high';
  isPinned?: boolean;
  dueDate?: string; // Alterado para string para facilitar com input type="date"
  tags: string[];
  subtasks?: Array<{ id: string; title: string; completed: boolean }>;
  embedUrl?: string;
  pomodoroSessions: number;
  parentTaskId?: number;
  relatedTaskIds: number[];
  gitHubIssueNumber?: number;
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
};

db.version(1).stores({
  workspaces: '++id, name, type',
  tasks: '++id, workspaceId, status, priority, dueDate, parentTaskId',
  flashcardDecks: '++id, taskId, difficulty',
  flashcards: '++id, deckId, nextReviewDate',
  periodicReports: '++id, workspaceId, periodType, dateString'
});

export { db };
