import { useState } from 'react';

import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { Avatar } from '@sdkwork/whatseek-h5-commons';
import type { ChatReply } from '@sdkwork/whatseek-h5-core';

import { cx } from '../services/chatStyles.js';

export interface ChatCardViewProps {
  cards: NonNullable<ChatReply['cards']>;
  entryId: string;
  consumed: boolean;
  onGenerateApp: (requirement: string, modules: string[]) => void;
  onConfirmSendMessage: (contactId: string, contactName: string, draft: string) => void;
  onDismiss: () => void;
}

/**
 * Renders AI reply cards (PRD §9.2/§17): app results, creation plan,
 * send-message confirmation, commerce previews, contact results.
 */
export function ChatCardView({
  cards,
  consumed,
  onGenerateApp,
  onConfirmSendMessage,
  onDismiss,
}: ChatCardViewProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) {
    return null;
  }

  return (
    <div className="space-y-2">
      {cards.map((card, index) => {
        const key = `${card.type}-${index}`;
        switch (card.type) {
          case 'app_results':
            return (
              <div key={key} className="overflow-hidden rounded-2xl border border-border-subtle bg-panel">
                {card.apps.map(({ app, reason }) => (
                  <div key={app.id} className="flex items-start gap-3 border-b border-border-subtle p-3 last:border-b-0">
                    <Avatar glyph={app.icon} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-primary">{app.name}</p>
                      <p className="mt-0.5 text-xs text-muted">{app.summary}</p>
                      <p className="mt-1 text-[0.625rem] text-brand">
                        {t('whatseek.chat.card.recommendReason', { keyword: reason })} · {app.priceLabel}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          navigate(`/apps/runner/${app.id}`);
                        }}
                        className="rounded-full bg-brand px-2.5 py-1 text-[0.625rem] font-medium text-white"
                      >
                        {t('whatseek.chat.card.useNow')}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          navigate(`/apps/create?basedOn=${encodeURIComponent(app.id)}`);
                        }}
                        className="rounded-full border border-border-subtle px-2.5 py-1 text-[0.625rem] text-secondary"
                      >
                        {t('whatseek.chat.card.createFrom')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            );
          case 'app_plan':
            return (
              <div key={key} className="rounded-2xl border border-border-subtle bg-panel p-3">
                <p className="text-sm font-semibold text-primary">{card.title}</p>
                <ul className="mt-2 space-y-1">
                  {card.modules.map((moduleName) => (
                    <li key={moduleName} className="flex items-center gap-1.5 text-xs text-secondary">
                      <span aria-hidden="true" className="text-success">✓</span>
                      {moduleName}
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    disabled={consumed}
                    onClick={() => {
                      onGenerateApp(card.requirement, card.modules);
                    }}
                    className="flex-1 rounded-full bg-brand py-1.5 text-xs font-semibold text-white disabled:opacity-40"
                  >
                    {consumed ? t('whatseek.chat.card.generatingDone') : t('whatseek.chat.card.generateNow')}
                  </button>
                  <button
                    type="button"
                    aria-label={t('whatseek.chat.card.dismiss')}
                    onClick={() => {
                      setDismissed(true);
                      onDismiss();
                    }}
                    className="rounded-full border border-border-subtle px-3 py-1.5 text-xs text-muted"
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          case 'send_message_confirm':
            return (
              <div key={key} className="rounded-2xl border border-border-subtle bg-panel p-3">
                <p className="text-sm font-medium text-primary">
                  {t('whatseek.chat.card.sendTo', { name: card.contactName })}
                </p>
                <p className="mt-2 rounded-xl bg-panel-muted p-2.5 text-xs text-secondary">{card.draft}</p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    disabled={consumed}
                    onClick={() => {
                      onConfirmSendMessage(card.contactId, card.contactName, card.draft);
                    }}
                    className="flex-1 rounded-full bg-brand py-1.5 text-xs font-semibold text-white disabled:opacity-40"
                  >
                    {consumed ? t('whatseek.chat.card.sent') : t('whatseek.chat.card.confirmSend')}
                  </button>
                  <button
                    type="button"
                    aria-label={t('whatseek.chat.card.dismiss')}
                    onClick={() => {
                      setDismissed(true);
                      onDismiss();
                    }}
                    className="rounded-full border border-border-subtle px-3 py-1.5 text-xs text-muted"
                  >
                    {t('whatseek.chat.card.cancel')}
                  </button>
                </div>
                <p className="mt-2 text-[0.625rem] text-muted">{t('whatseek.chat.card.confirmNote')}</p>
              </div>
            );
          case 'commerce_results':
            return (
              <div key={key} className="overflow-hidden rounded-2xl border border-border-subtle bg-panel">
                <p className="border-b border-border-subtle px-3 py-2 text-[0.625rem] text-muted">
                  {t(`whatseek.chat.card.commerce.${card.domain}`)}
                </p>
                {card.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 border-b border-border-subtle p-3 last:border-b-0">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-primary">{item.title}</p>
                      <p className="mt-0.5 text-xs text-muted">{item.subtitle}</p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-danger">{item.priceLabel}</span>
                  </div>
                ))}
                <p className="px-3 py-2 text-[0.625rem] text-muted">{t('whatseek.chat.card.commerceNote')}</p>
              </div>
            );
          case 'contact_results':
            return (
              <div key={key} className="overflow-hidden rounded-2xl border border-border-subtle bg-panel">
                {card.contacts.map((contact) => (
                  <button
                    key={contact.id}
                    type="button"
                    onClick={() => {
                      navigate(`/contacts/${contact.id}`);
                    }}
                    className={cx('flex w-full items-center gap-3 border-b border-border-subtle p-3 text-left last:border-b-0')}
                  >
                    <Avatar glyph={contact.avatar} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-primary">{contact.name}</span>
                      <span className="block truncate text-xs text-muted">{contact.bio}</span>
                    </span>
                    <span aria-hidden="true" className="text-muted">›</span>
                  </button>
                ))}
              </div>
            );
          default: {
            const exhaustive: never = card;
            return exhaustive;
          }
        }
      })}
    </div>
  );
}
