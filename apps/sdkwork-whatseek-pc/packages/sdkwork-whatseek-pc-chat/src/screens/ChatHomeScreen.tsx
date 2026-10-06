import { useEffect, useRef, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

import { ScreenState } from '@sdkwork/whatseek-pc-commons';
import { getWhatseekClient, useTabBadgeStore } from '@sdkwork/whatseek-pc-core';

import { ChatCardView } from '../components/ChatCardView.js';
import { TaskChip } from '../components/TaskChip.js';
import { SUGGESTION_KEYS } from '../data/suggestions.js';
import { useChatTurn } from '../hooks/useChatTurn.js';
import { useChatStore, type ChatEntry } from '../state/chatStore.js';

/**
 * 对话 tab root — the Chat First entry (PRD §8): "你想做什么？告诉我就可以。"
 * with a message composer, multi-turn thread, intent-routed reply cards, and
 * AI task state chips.
 */
export function ChatHomeScreen() {
  const { t } = useTranslation();
  const [error, setError] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const chat = getWhatseekClient('chat');
  const messagesPort = getWhatseekClient('messages');

  const threads = useChatStore((state) => state.threads);
  const activeThreadId = useChatStore((state) => state.activeThreadId);
  const consumedActionEntryIds = useChatStore((state) => state.consumedActionEntryIds);
  const activeTaskStates = useChatStore((state) => state.activeTaskStates);
  const setUnreadMessages = useTabBadgeStore((state) => state.setUnreadMessages);
  const { sending, submit } = useChatTurn();
  const [retryToken, setRetryToken] = useState(0);
  const [searchParams, setSearchParams] = useSearchParams();

  const activeThread = threads.find((thread) => thread.id === activeThreadId) ?? null;
  const entries: ChatEntry[] = activeThread?.entries ?? [];

  useEffect(() => {
    // jsdom (tests) does not implement scrollIntoView.
    if (typeof bottomRef.current?.scrollIntoView === 'function') {
      bottomRef.current.scrollIntoView({ block: 'end' });
    }
  }, [entries.length, sending]);

  useEffect(() => {
    // PRD §5.5 deep link: a task notification in Messages navigates here with
    // ?taskId=… — surface the task as a chat entry (result + state chip) once.
    const linkedTaskId = searchParams.get('taskId');
    if (linkedTaskId === null || linkedTaskId.length === 0) {
      return;
    }
    setSearchParams({}, { replace: true });
    if (activeTaskStates[linkedTaskId] !== undefined) {
      return;
    }
    void getWhatseekClient('tasks')
      .getTask(linkedTaskId)
      .then((task) => {
        if (task === null) {
          return;
        }
        useChatStore.getState().setTaskState(task.id, task.state);
        useChatStore.getState().addAssistantEntry({
          text: task.resultSummary ?? task.title,
          taskId: task.id,
        });
      })
      .catch(() => undefined);
    // Run once per mounted taskId — searchParams/setSearchParams are stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Reconcile chip states after a reload: activeTaskStates is runtime-only,
    // so restored threads would render every chip as pending (PRD §41 states
    // must survive a remount — parked waiting tasks re-expose their actions).
    for (const entry of entries) {
      if (entry.taskId === undefined || activeTaskStates[entry.taskId] !== undefined) {
        continue;
      }
      void getWhatseekClient('tasks')
        .getTask(entry.taskId)
        .then((task) => {
          if (task !== null) {
            useChatStore.getState().setTaskState(task.id, task.state);
          }
        })
        .catch(() => undefined);
    }
  }, [entries, activeTaskStates]);

  useEffect(() => {
    void messagesPort.getUnreadTotal().then(setUnreadMessages).catch(() => undefined);
  }, [messagesPort, setUnreadMessages, entries.length]);

  const isEmpty = entries.length === 0 && !sending;

  const handleError = () => {
    setError(true);
  };

  const runTaskResolution = (taskId: string, kind: 'confirm_task' | 'cancel_task') => {
    void (async () => {
      try {
        const outcome = await chat.runCardAction({ kind, taskId });
        const task = await getWhatseekClient('tasks').getTask(taskId);
        if (task !== null) {
          useChatStore.getState().setTaskState(task.id, task.state);
        }
        useChatStore.getState().addAssistantEntry({
          text: outcome.message,
          taskId: outcome.taskId,
        });
        if (task?.state === 'completed' || task?.state === 'cancelled' || task?.state === 'expired') {
          const total = await messagesPort.getUnreadTotal();
          setUnreadMessages(total);
        }
      } catch {
        handleError();
      }
    })();
  };

  if (error) {
    return (
      <div className="flex h-full flex-col">
        <ScreenState
          state="error"
          onRetry={() => {
            setError(false);
            setRetryToken((token) => token + 1);
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col" data-retry={retryToken}>
      {isEmpty ? (
        <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
          <p className="text-2xl font-semibold text-primary">{t('whatseek.chat.home.heroTitle')}</p>
          <p className="mt-2 text-sm text-muted">{t('whatseek.chat.home.heroSubtitle')}</p>
          <div className="mt-8 grid w-full max-w-sm grid-cols-1 gap-2">
            {SUGGESTION_KEYS.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  void submit(t(key));
                }}
                className="rounded-2xl border border-border-subtle bg-panel px-4 py-3 text-left text-sm text-secondary transition-colors hover:bg-panel-muted"
              >
                {t(key)}
              </button>
            ))}          </div>
        </div>
      ) : (
        <div className="flex-1 space-y-3 px-4 pt-4 pb-2">
          {entries.map((entry) => (
            <div key={entry.id} className={entry.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
              <div className={entry.role === 'user' ? 'max-w-[80%] space-y-2' : 'w-full max-w-[92%] space-y-2'}>
                <div
                  className={
                    entry.role === 'user'
                      ? 'rounded-2xl rounded-br-md bg-brand px-3.5 py-2.5 text-sm text-white'
                      : 'rounded-2xl rounded-bl-md border border-border-subtle bg-panel px-3.5 py-2.5 text-sm text-primary'
                  }
                >
                  {entry.role === 'assistant' ? t(entry.text, { defaultValue: entry.text, ...entry.params }) : entry.text}
                </div>
                {entry.taskId !== undefined ? (
                  <TaskChip
                    state={activeTaskStates[entry.taskId] ?? 'pending'}
                    onConfirm={
                      activeTaskStates[entry.taskId] === 'waiting_confirmation'
                        ? () => {
                            void runTaskResolution(entry.taskId ?? '', 'confirm_task');
                          }
                        : undefined
                    }
                    onCancel={
                      activeTaskStates[entry.taskId] === 'waiting_confirmation'
                        ? () => {
                            void runTaskResolution(entry.taskId ?? '', 'cancel_task');
                          }
                        : undefined
                    }
                  />
                ) : null}
                {entry.cards !== undefined && entry.cards.length > 0 ? (
                  <ChatCardView
                    cards={entry.cards}
                    entryId={entry.id}
                    consumed={consumedActionEntryIds.includes(entry.id)}
                    onGenerateApp={(requirement, modules) => {
                      void (async () => {
                        try {
                          const outcome = await chat.runCardAction({
                            kind: 'generate_app',
                            requirement,
                            modules,
                          });
                          useChatStore.getState().markActionConsumed(entry.id);
                          useChatStore.getState().addAssistantEntry({
                            text: outcome.message,
                            params: outcome.messageParams,
                            taskId: outcome.taskId,
                          });
                        } catch {
                          handleError();
                        }
                      })();
                    }}
                    onConfirmSendMessage={(contactId, contactName, draft) => {
                      void (async () => {
                        try {
                          const outcome = await chat.runCardAction({
                            kind: 'confirm_send_message',
                            contactId,
                            contactName,
                            draft,
                          });
                          useChatStore.getState().markActionConsumed(entry.id);
                          useChatStore.getState().addAssistantEntry({
                            text: outcome.message,
                            params: outcome.messageParams,
                          });
                          const total = await messagesPort.getUnreadTotal();
                          setUnreadMessages(total);
                        } catch {
                          handleError();
                        }
                      })();
                    }}
                    onDismiss={() => undefined}
                  />
                ) : null}
              </div>
            </div>
          ))}
          {sending ? (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-md border border-border-subtle bg-panel px-3.5 py-2.5 text-sm text-muted">
                {t('whatseek.chat.home.thinking')}
              </div>
            </div>
          ) : null}
          <div ref={bottomRef} />
        </div>
      )}

      <div className="shrink-0 border-t border-border-subtle bg-panel px-3 py-2.5">
        {isEmpty ? null : (
          <button
            type="button"
            onClick={() => {
              useChatStore.getState().startNewThread();
            }}
            className="mb-2 text-[0.625rem] text-muted underline-offset-2 hover:underline"
          >
            {t('whatseek.chat.home.newTopic')}
          </button>
        )}
        <form
          className="flex items-end gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            const form = event.currentTarget;
            const input = form.elements.namedItem('message');
            if (input instanceof HTMLTextAreaElement) {
              const value = input.value.trim();
              if (value.length === 0) {
                return;
              }
              input.value = '';
              void submit(value);
            }
          }}
        >
          <textarea
            name="message"
            rows={1}
            aria-label={t('whatseek.chat.home.inputLabel')}
            placeholder={t('whatseek.chat.home.inputPlaceholder')}
            className="max-h-24 min-h-10 flex-1 resize-none rounded-2xl border border-border-default bg-canvas px-3.5 py-2.5 text-sm text-primary outline-none placeholder:text-muted focus:border-brand"
          />
          <button
            type="submit"
            aria-label={t('whatseek.chat.home.send')}
            disabled={sending}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-white transition-opacity hover:bg-brand-hover disabled:opacity-40"
          >
            <span aria-hidden="true">➤</span>
          </button>
        </form>
      </div>
    </div>
  );
}
