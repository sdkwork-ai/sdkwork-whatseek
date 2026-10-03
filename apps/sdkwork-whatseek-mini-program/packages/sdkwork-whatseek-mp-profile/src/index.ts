/**
 * Public export boundary of `@sdkwork/whatseek-mp-profile` — profile and
 * settings view models (asset summary, appearance, language).
 */

import type { SessionUser } from '@sdkwork/whatseek-service-core';
import { getWhatseekClient } from '@sdkwork/whatseek-service-core';

export interface ProfileSummary {
  user: SessionUser | null;
  chats: number;
  apps: number;
  agents: number;
  contacts: number;
}

/**
 * Mock session (Phase 1 用户体系, H5/PC authState parity): a visitor session
 * auto-exists; sign-in promotes it to a named account so enterprise apps open
 * (mock IAM — Phase 2 swaps in the generated IAM client, the shape stays).
 */
let sessionUser: SessionUser = { id: 'visitor', name: '访客', avatar: '🙂', isVisitor: true };

export function getSessionUser(): SessionUser {
  return { ...sessionUser };
}

export function signIn(name?: string): SessionUser {
  const trimmed = (name ?? '').trim();
  sessionUser = {
    id: `user-${Date.now().toString(36)}`,
    name: trimmed.length > 0 ? trimmed : '问寻用户',
    avatar: '🙂',
    isVisitor: false,
  };
  return { ...sessionUser };
}

export function signOut(): SessionUser {
  sessionUser = { id: 'visitor', name: '访客', avatar: '🙂', isVisitor: true };
  return { ...sessionUser };
}

export async function loadProfileSummary(): Promise<ProfileSummary> {
  const [conversations, myApps, contacts] = await Promise.all([
    getWhatseekClient('messages').listConversations(),
    getWhatseekClient('apps').listMyApps(),
    getWhatseekClient('contacts').listContacts(),
  ]);
  const agents = contacts.filter((contact) => contact.kind === 'agent' || contact.kind === 'assistant').length;
  return {
    user: getSessionUser(),
    chats: conversations.length,
    apps: myApps.length,
    agents,
    contacts: contacts.length,
  };
}

export interface AppearanceSettings {
  colorMode: 'light' | 'dark';
  locale: 'zh-CN' | 'en-US';
}

let settings: AppearanceSettings = { colorMode: 'light', locale: 'zh-CN' };

export function getAppearanceSettings(): AppearanceSettings {
  return { ...settings };
}

export function setAppearanceSettings(next: Partial<AppearanceSettings>): AppearanceSettings {
  settings = { ...settings, ...next };
  return { ...settings };
}
