import { useCallback, useEffect, useRef, useState } from 'react';

import { getWhatseekClient } from '@sdkwork/whatseek-h5-core';

import { useChatStore } from '../state/chatStore.js';

/**
 * One chat turn: append the user entry, await the AI reply, append the
 * assistant entry, then poll the task store while its task is in flight so
 * TaskChip reflects Pending → Running → Completed (PRD §41).
 */
export function useChatTurn(): { sending: boolean; submit: (text: string) => Promise<void> } {
  const [sending, setSending] = useState(false);
  const pollHandle = useRef<ReturnType<typeof globalThis.setTimeout> | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    // Re-arm on every mount: React StrictMode mounts → cleans up → mounts
    // again, so the flag must be set in the effect body, not only at origin.
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (pollHandle.current !== null) {
        globalThis.clearTimeout(pollHandle.current);
      }
    };
  }, []);

  const pollTask = useCallback((taskId: string, attempt: number) => {
    if (!mounted.current || attempt > 16) {
      return;
    }
    pollHandle.current = globalThis.setTimeout(() => {
      const tasks = getWhatseekClient('tasks');
      void tasks
        .getTask(taskId)
        .then((task) => {
          if (task !== null) {
            useChatStore.getState().setTaskState(task.id, task.state);
            if (task.state === 'pending' || task.state === 'running' || task.state === 'waiting_confirmation') {
              pollTask(task.id, attempt + 1);
            }
          }
        })
        .catch(() => undefined);
    }, 500);
  }, []);

  const submit = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (trimmed.length === 0) {
        return;
      }
      const chat = getWhatseekClient('chat');
      setSending(true);
      useChatStore.getState().sendUserMessage(trimmed);
      try {
        const reply = await chat.handleSend(trimmed);
        if (!mounted.current) {
          return;
        }
        useChatStore.getState().addAssistantEntry({
          text: reply.contentKey,
          params: reply.contentParams,
          cards: reply.cards,
          taskId: reply.taskId,
        });
        if (reply.taskId !== undefined) {
          pollTask(reply.taskId, 0);
        }
      } catch {
        useChatStore.getState().addAssistantEntry({
          text: 'whatseek.chat.reply.error',
        });
      } finally {
        if (mounted.current) {
          setSending(false);
        }
      }
    },
    [pollTask],
  );

  return { sending, submit };
}
