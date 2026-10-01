/**
 * Cross-package UI badges (e.g. unread message count on the 消息 tab).
 * Capability packages publish; the shell subscribes.
 */

import { create } from 'zustand';

interface TabBadgeState {
  unreadMessages: number;
  setUnreadMessages: (total: number) => void;
}

export const useTabBadgeStore = create<TabBadgeState>((set) => ({
  unreadMessages: 0,
  setUnreadMessages: (total) => {
    set({ unreadMessages: Math.max(0, total) });
  },
}));
