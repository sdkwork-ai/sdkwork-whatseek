/**
 * Mock AI task store (PRD §41 task states). The chat client drives
 * Pending → Running → Waiting Confirmation transitions through an injectable
 * scheduler; the user's confirm/cancel card actions (or lazy expiry of an
 * abandoned waiting task) resolve the terminal state.
 */

import type { WhatseekTask } from '../types.js';
import type { TasksPort } from '../ports.js';

interface Storage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

const TASKS_KEY = 'whatseek.tasks';

/** Default idle time a waiting_confirmation task survives before expiring. */
const DEFAULT_WAITING_EXPIRY_MS = 5 * 60 * 1000;

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
  /** Idle time in ms after which a waiting_confirmation task expires (default 5 min). */
  waitingExpiryMs?: number;
}

export function createMockTasksClient(options: MockTasksClientOptions = {}): TasksPort {
  const storage = options.storage === undefined ? defaultStorage() : options.storage;
  const now = options.now ?? (() => new Date());
  const waitingExpiryMs = options.waitingExpiryMs ?? DEFAULT_WAITING_EXPIRY_MS;
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

  // Lazy expiry on read: an abandoned waiting_confirmation task is expired
  // the next time anyone looks at it (PRD §41 异常态 Expired without a
  // server-side scheduler).
  const expireStale = (): boolean => {
    const cutoff = now().getTime() - waitingExpiryMs;
    let changed = false;
    tasks = tasks.map((task) => {
      if (task.state !== 'waiting_confirmation') {
        return task;
      }
      const updatedAt = Date.parse(task.updatedAt);
      if (!Number.isNaN(updatedAt) && updatedAt <= cutoff) {
        changed = true;
        return { ...task, state: 'expired', updatedAt: now().toISOString() };
      }
      return task;
    });
    if (changed) {
      persist();
    }
    return changed;
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
      expireStale();
      return tasks.find((task) => task.id === taskId) ?? null;
    },
    async listTasks() {
      expireStale();
      return [...tasks];
    },
  };
}
