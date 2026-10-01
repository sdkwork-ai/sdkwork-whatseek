import { NavLink } from 'react-router-dom';

import { useTranslation } from 'react-i18next';
import { LayoutGrid, MessageSquare, Sparkles, User, Users, type LucideIcon } from 'lucide-react';

import { useTabBadgeStore, WHATSEEK_TABS } from '@sdkwork/whatseek-h5-core';
import type { TabId } from '@sdkwork/whatseek-h5-core';

import { cx } from '../navigation/tabStyles.js';

const TAB_ICONS: Record<TabId, LucideIcon> = {
  chat: Sparkles,
  apps: LayoutGrid,
  contacts: Users,
  messages: MessageSquare,
  profile: User,
};

/**
 * The fixed five-tab bottom navigation (PRD §7). The unread badge on 消息
 * comes from the core badge store, published by the messages capability.
 */
export function TabBar() {
  const { t } = useTranslation();
  const unreadMessages = useTabBadgeStore((state) => state.unreadMessages);
  return (
    <nav
      aria-label={t('whatseek.shell.tabbar.label')}
      className="shrink-0 border-t border-border-subtle bg-panel pb-[max(env(safe-area-inset-bottom),0.25rem)]"
    >
      <ul className="mx-auto flex w-full max-w-[42rem] items-stretch">
        {WHATSEEK_TABS.map((tab) => {
          const Icon = TAB_ICONS[tab.id];
          const badge = tab.id === 'messages' && unreadMessages > 0 ? unreadMessages : null;
          return (
            <li key={tab.id} className="flex-1">
              <NavLink
                to={tab.path}
                className={({ isActive }) =>
                  cx(
                    'flex flex-col items-center gap-0.5 py-2 text-[0.625rem] font-medium transition-colors',
                    isActive ? 'text-brand' : 'text-muted hover:text-secondary',
                  )
                }
              >
                <span className="relative">
                  <Icon aria-hidden="true" strokeWidth={1.75} className="h-6 w-6" />
                  {badge !== null ? (
                    <span
                      data-testid="tab-badge-messages"
                      className="absolute -top-1 -right-2 min-w-4 rounded-full bg-danger px-1 text-center text-[0.625rem] leading-4 font-semibold text-white"
                    >
                      {badge > 99 ? '99+' : badge}
                    </span>
                  ) : null}
                </span>
                <span>{t(tab.titleKey)}</span>
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
