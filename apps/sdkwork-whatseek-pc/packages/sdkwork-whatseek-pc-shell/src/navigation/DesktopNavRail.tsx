import { NavLink, useLocation } from 'react-router-dom';

import { useTranslation } from 'react-i18next';
import {
  LayoutGrid,
  MessageSquare,
  Sparkles,
  User,
  Users,
  type LucideIcon,
} from 'lucide-react';

import { useSessionStore, useTabBadgeStore, WHATSEEK_TABS } from '@sdkwork/whatseek-pc-core';
import type { TabId } from '@sdkwork/whatseek-pc-core';

import { cx } from './navStyles.js';

const TAB_ICONS: Record<TabId, LucideIcon> = {
  chat: Sparkles,
  apps: LayoutGrid,
  contacts: Users,
  messages: MessageSquare,
  profile: User,
};

/**
 * Desktop navigation rail (APP_PC_REACT_UI_SPEC.md: large-screen navigation —
 * sidebar/rail, never phone-first bottom tabs). The five tab identities are
 * the same cross-surface contract as H5/mini-program/Flutter. Icon states
 * mirror the mobile tab-bar norm: the selected rail item renders the filled
 * glyph, unselected items stay outline.
 */
export function DesktopNavRail() {
  const { t } = useTranslation();
  const unreadMessages = useTabBadgeStore((state) => state.unreadMessages);
  const user = useSessionStore((state) => state.user);
  const { pathname } = useLocation();
  return (
    <aside
      aria-label={t('whatseek.shell.navrail.label')}
      className="flex h-full w-60 shrink-0 flex-col border-r border-border-subtle bg-panel"
    >
      <div className="flex items-center gap-2 px-5 py-5">
        <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-lg text-white">
          问
        </span>
        <span className="text-base font-semibold text-primary">WhatSeek 问寻</span>
      </div>
      <nav className="flex-1 px-3">
        <ul className="space-y-1">
          {WHATSEEK_TABS.map((tab) => {
            const Icon = TAB_ICONS[tab.id];
            const isActive = pathname === tab.path || pathname.startsWith(`${tab.path}/`);
            const badge = tab.id === 'messages' && unreadMessages > 0 ? unreadMessages : null;
            return (
              <li key={tab.id}>
                <NavLink
                  to={tab.path}
                  aria-current={isActive ? 'page' : undefined}
                  className={cx(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-brand-soft text-brand'
                      : 'text-secondary hover:bg-panel-muted hover:text-primary',
                  )}
                >
                  <Icon
                    aria-hidden="true"
                    strokeWidth={1.75}
                    fill={isActive ? 'currentColor' : 'none'}
                    className="h-5 w-5"
                  />
                  <span className="flex-1">{t(tab.titleKey)}</span>
                  {badge !== null ? (
                    <span
                      data-testid="nav-badge-messages"
                      className="min-w-5 rounded-full bg-danger px-1.5 text-center text-[0.625rem] leading-5 font-semibold text-white"
                    >
                      {badge > 99 ? '99+' : badge}
                    </span>
                  ) : null}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="border-t border-border-subtle px-4 py-3">
        <p className="truncate text-sm font-medium text-primary">
          {user !== null && !user.isVisitor ? user.name : t('whatseek.shell.navrail.visitor')}
        </p>
        <p className="mt-0.5 text-[0.625rem] text-muted">{t('whatseek.shell.navrail.brand')}</p>
      </div>
    </aside>
  );
}
