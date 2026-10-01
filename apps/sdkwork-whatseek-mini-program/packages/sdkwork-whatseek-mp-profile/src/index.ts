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
  contacts: number;
}

export async function loadProfileSummary(): Promise<ProfileSummary> {
  const [conversations, myApps, contacts] = await Promise.all([
    getWhatseekClient('messages').listConversations(),
    getWhatseekClient('apps').listMyApps(),
    getWhatseekClient('contacts').listContacts(),
  ]);
  return {
    user: { id: 'visitor', name: '访客', avatar: '🙂', isVisitor: true },
    chats: conversations.length,
    apps: myApps.length,
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
