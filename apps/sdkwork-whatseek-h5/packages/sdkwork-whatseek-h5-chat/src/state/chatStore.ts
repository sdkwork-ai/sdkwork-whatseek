/**
 * Chat thread state (zustand + localStorage persistence). The standalone
 * milestone keeps one persisted thread list; Phase 2 moves thread storage to
 * the platform conversation service behind the same store shape.
 */

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { ChatReply, WhatseekTask } from '@sdkwork/whatseek-h5-core';

export interface ChatEntry {
  id: string;
  role: 'user' | 'assistant';
  /** Plain text for user turns; i18n key for assistant turns. */
  text: string;
  /** Assistant turns: interpolation params for the i18n key. */
  params?: Record<string, unknown> | undefined;
  cards?: ChatReply['cards'] | undefined;
  taskId?: string | undefined;
  sentAt: string;
}

export interface ChatThread {
  id: string;
  title: string;
  entries: ChatEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface AssistantEntryInput {
  text: string;
  params?: Record<string, unknown> | undefined;
  cards?: ChatReply['cards'] | undefined;
  taskId?: string | undefined;
}

interface ChatState {
  threads: ChatThread[];
  activeThreadId: string | null;
  /** Entry ids whose card action already ran (generate/confirm are one-shot). */
  consumedActionEntryIds: string[];
  activeTaskStates: Record<string, WhatseekTask['state']>;
  sendUserMessage: (text: string) => string;
  addAssistantEntry: (entry: AssistantEntryInput) => string;
  appendToActiveThread: (entry: ChatEntry) => void;
  markActionConsumed: (entryId: string) => void;
  setTaskState: (taskId: string, state: WhatseekTask['state']) => void;
  startNewThread: () => void;
}

function makeId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`;
}

function deriveThreadTitle(text: string): string {
  const trimmed = text.trim();
  return trimmed.length > 16 ? `${trimmed.slice(0, 16)}…` : trimmed;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      threads: [],
      activeThreadId: null,
      consumedActionEntryIds: [],
      activeTaskStates: {},
      sendUserMessage: (text) => {
        const stamp = new Date().toISOString();
        const state = get();
        let threadId = state.activeThreadId;
        const entry: ChatEntry = {
          id: makeId('entry'),
          role: 'user',
          text,
          sentAt: stamp,
        };
        if (threadId === null) {
          threadId = makeId('thread');
          const thread: ChatThread = {
            id: threadId,
            title: deriveThreadTitle(text),
            entries: [entry],
            createdAt: stamp,
            updatedAt: stamp,
          };
          set({ threads: [thread, ...state.threads], activeThreadId: threadId });
        } else {
          set({
            threads: state.threads.map((thread) =>
              thread.id === threadId
                ? { ...thread, entries: [...thread.entries, entry], updatedAt: stamp }
                : thread,
            ),
          });
        }
        return entry.id;
      },
      addAssistantEntry: (entry) => {
        const id = makeId('entry');
        get().appendToActiveThread({
          ...entry,
          id,
          role: 'assistant',
          sentAt: new Date().toISOString(),
        });
        return id;
      },
      appendToActiveThread: (entry) => {
        const state = get();
        const threadId = state.activeThreadId;
        if (threadId === null) {
          return;
        }
        const stamp = new Date().toISOString();
        set({
          threads: state.threads.map((thread) =>
            thread.id === threadId
              ? { ...thread, entries: [...thread.entries, entry], updatedAt: stamp }
              : thread,
          ),
        });
      },
      markActionConsumed: (entryId) => {
        set((state) => ({ consumedActionEntryIds: [...state.consumedActionEntryIds, entryId] }));
      },
      setTaskState: (taskId, taskState) => {
        set((state) => ({ activeTaskStates: { ...state.activeTaskStates, [taskId]: taskState } }));
      },
      startNewThread: () => {
        set({ activeThreadId: null });
      },
    }),
    {
      name: 'whatseek.chat-threads',
      storage: createJSONStorage(() => globalThis.localStorage),
      partialize: (state) => ({
        threads: state.threads,
        activeThreadId: state.activeThreadId,
        consumedActionEntryIds: state.consumedActionEntryIds,
      }),
    },
  ),
);
