/**
 * Mock session store (Phase 1 用户体系). A visitor session is created
 * automatically so the standalone app is immediately usable; Profile offers
 * sign-in/sign-out. Phase 2 replaces this with IAM-backed sessions via the
 * appbase runtime — the store shape is the seam.
 */

import { create } from 'zustand';

import type { SessionUser } from '../types.js';

interface SessionState {
  user: SessionUser | null;
  signIn: (name: string) => void;
  signOut: () => void;
  ensureVisitor: () => void;
}

function makeUser(name: string, isVisitor: boolean): SessionUser {
  return {
    id: isVisitor ? 'visitor' : `user-${Date.now().toString(36)}`,
    name,
    avatar: '🙂',
    isVisitor,
  };
}

export const useSessionStore = create<SessionState>((set, get) => ({
  user: null,
  signIn: (name) => {
    const trimmed = name.trim();
    set({ user: makeUser(trimmed.length > 0 ? trimmed : '问寻用户', false) });
  },
  signOut: () => {
    set({ user: null });
  },
  ensureVisitor: () => {
    if (get().user === null) {
      set({ user: makeUser('访客', true) });
    }
  },
}));

export function getCurrentUser(): SessionUser | null {
  return useSessionStore.getState().user;
}
