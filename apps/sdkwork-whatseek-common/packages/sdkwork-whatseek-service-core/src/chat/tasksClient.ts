/**
 * Mock AI task store (PRD §41 task states). The chat client drives
 * Pending → Running → (Waiting Confirmation) → Completed transitions through
 * an injectable scheduler; failed paths surface Failed/Cancelled.
 */

import type { WhatseekTask } from '../types.js';
import type { TasksPort } from '../ports.js';

interface Storage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

const TASKS_KEY = 'whatseek.tasks';

function defaultStorage(): Storage | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

function readTasks(storage: Storage | null): WhatseekTask[] {
  if (storage === null) {
    return [];
  }
  try {
    const raw = storage.getItem(TASKS_KEY);
    const parsed: unknown = raw === null ? null : JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as WhatseekTask[]) : [];
  } catch {
    return [];
  }
}

export interface MockTasksClientOptions {
  storage?: Storage | null;
  now?: () => Date;
}

export function createMockTasksClient(options: MockTasksClientOptions = {}): TasksPort {
  const storage = options.storage === undefined ? defaultStorage() : options.storage;
  const now = options.now ?? (() => new Date());
  let tasks: WhatseekTask[] = readTasks(storage);

  const persist = () => {
    if (storage !== null) {
      try {
        storage.setItem(TASKS_KEY, JSON.stringify(tasks));
      } catch {
        /* storage unavailable */
      }
    }
  };

  return {
    async createTask(input) {
      const stamp = now().toISOString();
      const task: WhatseekTask = {
        id: `task-${stamp}-${Math.floor(Math.random() * 1e6).toString(36)}`,
        title: input.title,
        intent: input.intent,
        state: 'pending',
        createdAt: stamp,
        updatedAt: stamp,
      };
      tasks = [task, ...tasks];
      persist();
      return task;
    },
    async updateTaskState(taskId, state, resultSummary) {
      const existing = tasks.find((task) => task.id === taskId);
      if (existing === undefined) {
        throw new Error(`task not found: ${taskId}`);
      }
      const updated: WhatseekTask = {
        ...existing,
        state,
        updatedAt: now().toISOString(),
        ...(resultSummary !== undefined ? { resultSummary } : {}),
      };
      tasks = tasks.map((task) => (task.id === taskId ? updated : task));
      persist();
      return updated;
    },
    async getTask(taskId) {
      return tasks.find((task) => task.id === taskId) ?? null;
    },
    async listTasks() {
      return [...tasks];
    },
  };
}
