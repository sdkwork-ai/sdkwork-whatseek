import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import { Avatar, Card, ScreenState, useAsyncData } from '@sdkwork/whatseek-h5-commons';
import { getWhatseekClient } from '@sdkwork/whatseek-h5-core';

/** Contact detail (PRD §26): profile, tags, company, and a 发消息 action. */
export function ContactDetailScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { contactId = '' } = useParams();
  const contacts = getWhatseekClient('contacts');

  const detail = useAsyncData(() => contacts.getContact(contactId), [contacts, contactId]);

  if (detail.state === 'loading') {
    return <ScreenState state="loading" />;
  }
  if (detail.state === 'error') {
    return <ScreenState state="error" onRetry={detail.retry} />;
  }
  const contact = detail.data;
  if (contact === null) {
    return <ScreenState state="empty" titleKey="whatseek.contacts.detail.notFound" />;
  }

  return (
    <div className="pb-6">
      <header className="flex items-center gap-2 px-4 pt-4">
        <button
          type="button"
          aria-label={t('whatseek.commons.action.back')}
          onClick={() => {
            navigate(-1);
          }}
          className="text-xl text-secondary"
        >
          ‹
        </button>
        <h1 className="text-base font-semibold text-primary">{t('whatseek.contacts.detail.title')}</h1>
      </header>

      <div className="flex flex-col items-center gap-2 px-4 pt-6 text-center">
        <Avatar glyph={contact.avatar} size="lg" />
        <p className="text-lg font-semibold text-primary">{contact.name}</p>
        <p className="text-xs text-muted">{contact.bio}</p>
        <div className="mt-1 flex flex-wrap justify-center gap-1.5">
          {contact.tags.map((tag) => (
            <span key={tag} className="rounded-full border border-border-subtle px-2 py-0.5 text-[0.625rem] text-secondary">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {contact.company !== undefined ? (
        <Card className="mt-4 p-4">
          <h2 className="text-sm font-semibold text-primary">{t('whatseek.contacts.detail.company')}</h2>
          <p className="mt-1 text-sm text-secondary">{contact.company}</p>
        </Card>
      ) : null}

      <div className="px-4 pt-4">
        <button
          type="button"
          onClick={() => {
            const messages = getWhatseekClient('messages');
            void messages
              .openDirectConversation(contact.id)
              .then((conversation) => {
                navigate(`/messages/c/${conversation.id}`);
              })
              .catch(() => undefined);
          }}
          className="w-full rounded-full bg-brand py-3 text-sm font-semibold text-white hover:bg-brand-hover"
        >
          {t('whatseek.contacts.detail.sendMessage')}
        </button>
      </div>
    </div>
  );
}
