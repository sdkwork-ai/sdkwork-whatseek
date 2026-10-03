import { useEffect, useRef, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import { ScreenState } from '@sdkwork/whatseek-h5-commons';
import { SdkworkMobileNavBar } from '@sdkwork/shell-mobile-react/navbar';
import { getWhatseekClient, useTabBadgeStore } from '@sdkwork/whatseek-h5-core';
import type { ChatMessage } from '@sdkwork/whatseek-h5-core';

import { useAsyncData } from '../hooks/useMessagesData.js';

/** One conversation: message thread + composer (PRD §27 private/group chat). */
export function ConversationScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { conversationId = '' } = useParams();
  const messages = getWhatseekClient('messages');
  const setUnreadMessages = useTabBadgeStore((state) => state.setUnreadMessages);
  const [draft, setDraft] = useState('');
  const [extraMessages, setExtraMessages] = useState<readonly ChatMessage[]>([]);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  // Realtime-backed ports push conversation activity (new remote message,
  // read-state change); the tick re-runs the loaders. Mock ports stay pull-based.
  const [conversationTick, setConversationTick] = useState(0);

  useEffect(
    () =>
      messages.events?.onConversationChanged((changedId) => {
        if (changedId === conversationId) {
          setConversationTick((tick) => tick + 1);
        }
      }),
    [messages, conversationId],
  );

  const conversation = useAsyncData(async () => {
    const all = await messages.listConversations();
    return all.find((entry) => entry.id === conversationId) ?? null;
  }, [messages, conversationId, conversationTick]);

  const history = useAsyncData(
    () => messages.listMessages(conversationId),
    [messages, conversationId, conversationTick],
  );

  useEffect(() => {
    void messages
      .markRead(conversationId)
      .then(() => messages.getUnreadTotal())
      .then(setUnreadMessages)
      .catch(() => undefined);
  }, [messages, conversationId, setUnreadMessages]);

  const historyMessages = history.state === 'ready' ? history.data : [];
  const conversationReady = conversation.state === 'ready' ? conversation.data : null;
  const historyError = history.state === 'error' ? history.retry : null;
  const conversationError = conversation.state === 'error' ? conversation.retry : null;

  useEffect(() => {
    // jsdom (tests) does not implement scrollIntoView.
    if (typeof bottomRef.current?.scrollIntoView === 'function') {
      bottomRef.current.scrollIntoView({ block: 'end' });
    }
  }, [historyMessages.length, extraMessages.length]);

  const send = () => {
    const content = draft.trim();
    if (content.length === 0) {
      return;
    }
    setDraft('');
    void messages
      .sendMessage(conversationId, content)
      .then((sent) => {
        setExtraMessages((current) => [...current, sent]);
        // Surface the demo auto-reply once it lands.
        globalThis.setTimeout(() => {
          void messages.listMessages(conversationId).then((all) => {
            const known = new Set([...historyMessages, ...extraMessages].map((message) => message.id));
            setExtraMessages(all.filter((message) => !known.has(message.id)));
          });
        }, 1200);
      })
      .catch(() => undefined);
  };

  if (conversation.state === 'loading' || history.state === 'loading') {
    return <ScreenState state="loading" />;
  }
  if (history.state === 'error') {
    return <ScreenState state="error" onRetry={historyError ?? undefined} />;
  }
  if (conversation.state === 'error') {
    return <ScreenState state="error" onRetry={conversationError ?? undefined} />;
  }
  const header = conversationReady;
  if (header === null) {
    return <ScreenState state="empty" titleKey="whatseek.messages.conversation.notFound" />;
  }

  const allMessages = [...historyMessages, ...extraMessages];

  return (
    <div className="flex min-h-full flex-col">
      <SdkworkMobileNavBar
        title={header.title ?? t(header.titleKey ?? 'whatseek.messages.kind.system')}
        onBack={() => {
          navigate(-1);
        }}
      />

      <div className="flex-1 space-y-2.5 px-4 py-4">
        {allMessages.length === 0 ? (
          <ScreenState state="empty" titleKey="whatseek.messages.conversation.emptyTitle" />
        ) : (
          allMessages.map((message) => {
            const mine = message.senderId === 'me';
            return (
              <div key={message.id} className={mine ? 'flex justify-end' : 'flex justify-start'}>
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm ${
                    mine
                      ? 'rounded-br-md bg-brand text-white'
                      : 'rounded-bl-md border border-border-subtle bg-panel text-primary'
                  }`}
                  data-message-kind={message.kind}
                >
                  {message.kind === 'system' || message.kind === 'task' ? (
                    <span className="text-xs text-muted">{message.content}</span>
                  ) : (
                    message.content
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <div className="sticky bottom-0 border-t border-border-subtle bg-panel px-3 py-2.5">
        <form
          className="flex items-center gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            send();
          }}
        >
          <input
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value);
            }}
            placeholder={t('whatseek.messages.conversation.inputPlaceholder')}
            aria-label={t('whatseek.messages.conversation.inputLabel')}
            className="flex-1 rounded-full border border-border-default bg-canvas px-4 py-2 text-sm text-primary outline-none placeholder:text-muted focus:border-brand"
          />
          <button
            type="submit"
            aria-label={t('whatseek.messages.conversation.send')}
            disabled={draft.trim().length === 0}
            className="rounded-full bg-brand px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
          >
            {t('whatseek.messages.conversation.send')}
          </button>
        </form>
      </div>
    </div>
  );
}
