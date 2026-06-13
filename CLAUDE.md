# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # Start dev server at http://localhost:3000
npm run build    # Production build
npm run lint     # ESLint
```

No test runner is configured.

## Stack

- **Next.js 16.2.7** (App Router) — see AGENTS.md warning about API differences
- **React 19.2.4** with TypeScript strict mode
- **Dexie 4.4.3** (IndexedDB) — local-first, no backend
- **@hello-pangea/dnd** for drag-and-drop
- **lucide-react** for icons
- Vanilla CSS (no Tailwind, no CSS-in-JS); theme tokens in `src/styles/variables.css`
- Path alias: `@/*` → `src/*`

## Architecture

**Local-first**: All data lives in IndexedDB via Dexie. There is no API backend. Every page is a Client Component.

**State management**: No Redux/Zustand. Components use `useLiveQuery` from `dexie-react-hooks` to subscribe directly to the DB. Local `useState` handles transient form inputs before committing.

**Data flow**: Components query the DB directly — there is no service/DAO layer. When you need to read/write tasks, import `db` from `src/db/dexie.ts` and call Dexie methods inline.

**Pages**:
- `/` — global overview across all workspaces (pinned tasks first, then by workspace)
- `/workspace/[id]` — single workspace with Kanban or Calendar view
- `/stats` — productivity metrics (pomodoro sessions, completed tasks)

**Split-panel layout**: workspace and overview pages open a `TaskDetailPanel` on the right when a task is selected. The main list/board stays on the left.

## Database Schema (`src/db/dexie.ts`)

Five tables: `workspaces`, `tasks`, `flashcardDecks`, `flashcards`, `periodicReports`.

Key `Task` fields:
- `workspaceId: string` — foreign key to a Workspace
- `status: string` — `'todo' | 'doing' | 'blocked' | 'done'`
- `parentTaskId?: number` — self-reference for subtasks
- `pomodoroSessions: number` — incremented by PomodoroTimer
- `links?: { title, url, isPinned }[]`

`Flashcard` uses a SM2 spaced-repetition schema (`repetitions`, `interval`, `easeFactor`, `nextReviewDate`).

## Conventions

- Co-locate component CSS: `KanbanBoard.tsx` + `KanbanBoard.css` in the same folder
- All client components must have `'use client'` at the top
- `use client` components import `db` directly; no server actions or API routes exist
- No environment variables are currently required

## Skill routing

When the user's request matches an available skill, invoke it via the Skill tool. When in doubt, invoke the skill.

Key routing rules:
- Product ideas/brainstorming → invoke /office-hours
- Strategy/scope → invoke /plan-ceo-review
- Architecture → invoke /plan-eng-review
- Design system/plan review → invoke /design-consultation or /plan-design-review
- Full review pipeline → invoke /autoplan
- Bugs/errors → invoke /investigate
- QA/testing site behavior → invoke /qa or /qa-only
- Code review/diff check → invoke /review
- Visual polish → invoke /design-review
- Ship/deploy/PR → invoke /ship or /land-and-deploy
- Save progress → invoke /context-save
- Resume context → invoke /context-restore
- Author a backlog-ready spec/issue → invoke /spec
