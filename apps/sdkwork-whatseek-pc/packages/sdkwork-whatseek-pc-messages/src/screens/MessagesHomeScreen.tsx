import { useEffect } from 'react';

import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { Avatar, Card, ListRow, ScreenState } from '@sdkwork/whatseek-pc-commons';
import { getWhatseekClient, useTabBadgeStore } from '@sdkwork/whatseek-pc-core';

import { useAsyncData } from '../hooks/useMessagesData.js';
import { conversationKindGlyph } from '../services/messagesClient.js';

/** 消息 tab root (PRD §27/§42): the unified event center. */
export function MessagesHomeScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const messages = getWhatseekClient('messages');
  const setUnreadMessages = useTabBadgeStore((state) => state.setUnreadMessages);

  const conversations = useAsyncData(() => messages.listConversations(), [messages]);

  useEffect(() => {
    if (conversations.state === 'ready') {
      setUnreadMessages(conversations.data.reduce((total, conversation) => total + conversation.unread, 0));
    }
  }, [conversations, setUnreadMessages]);

  return (
    <div className="pb-6">
      <header className="px-4 pt-4">
        <h1 className="text-lg font-semibold text-primary">{t('whatseek.messages.home.title')}</h1>
        <p className="mt-0.5 text-xs text-muted">{t('whatseek.messages.home.subtitle')}</p>
      </header>

      <ScreenState
        state={
          conversations.state === 'loading'
            ? 'loading'
            : conversations.state === 'error'
              ? 'error'
              : conversations.data.length === 0
                ? 'empty'
                : 'success'
        }
        onRetry={conversations.state === 'error' ? conversations.retry : undefined}
      >
        {conversations.state === 'ready' ? (
          <Card className="mt-3">
            {conversations.data.map((conversation) => (
              <div key={conversation.id} className="border-b border-border-subtle last:border-b-0">
                <ListRow
                  leading={<Avatar glyph={conversationKindGlyph(conversation.kind)} tone={conversation.unread > 0 ? 'brand' : 'info'} />}
                  title={conversation.title ?? t(conversation.titleKey ?? 'whatseek.messages.kind.system')}
                  description={conversation.lastMessagePreview ?? ''}
                  trailing={
                    <span className="flex shrink-0 flex-col items-end gap-1">
                      <span className="text-[0.625rem] text-muted">
                        {conversation.updatedAt.slice(5, 10)}
                      </span>
                      {conversation.unread > 0 ? (
                        <span className="min-w-4 rounded-full bg-danger px-1 text-center text-[0.625rem] leading-4 font-semibold text-white">
                          {conversation.unread}
                        </span>
                      ) : null}
                    </span>
                  }
                  onClick={() => {
                    navigate(`/messages/c/${conversation.id}`);
                  }}
                />
              </div>
            ))}
          </Card>
        ) : null}
      </ScreenState>
    </div>
  );
}
