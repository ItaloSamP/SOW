'use client';

import { useEffect } from 'react';
import { db } from '@/db/dexie';

// Runs once on mount: ensures subtask workspaceIds match their parent
export function useOrphanRepair() {
  useEffect(() => {
    const repair = async () => {
      try {
        const tasks = await db.tasks.toArray();
        const byId = new Map(tasks.map(t => [t.id, t]));
        for (const task of tasks) {
          if (!task.parentTaskId) continue;
          const parent = byId.get(task.parentTaskId);
          if (parent && parent.workspaceId !== task.workspaceId) {
            await db.tasks.update(task.id!, { workspaceId: parent.workspaceId });
          }
        }
      } catch (err) {
        console.error('OrphanRepair error:', err);
      }
    };
    repair();
  }, []);
}
