/**
 * Shared domain model for the WhatSeek (问寻) super app.
 *
 * These types are the cross-capability contract: capability packages depend on
 * them; the concrete data behind them arrives through the SDK ports in
 * `sdk/ports.ts` (mock clients in Phase 1, generated SDK clients in Phase 2).
 */

/** Bottom navigation tab identifiers. */
export type TabId = 'chat' | 'apps' | 'contacts' | 'messages' | 'profile';

/** PRD §15 application forms surfaced by the app center. */
export type WhatseekAppKind = 'web' | 'mini' | 'ai' | 'agent' | 'skill' | 'external' | 'enterprise' | 'generated';

export interface WhatseekApp {
  id: string;
  name: string;
  summary: string;
  developer: string;
  category: string;
  kind: WhatseekAppKind;
  /** Emoji glyph rendered on the app tile (Phase 1 catalog visual). */
  icon: string;
  /** 0–5 rating. */
  rating: number;
  /** Human-readable user count, e.g. `1.2万`. */
  usersLabel: string;
  /** Human-readable price, e.g. `免费` / `¥12/月`. */
  priceLabel: string;
  aiCapability: boolean;
  tags: string[];
  updatedAt: string;
  permissions: string[];
}

/** PRD §20 lifecycle states for AI-generated apps. */
export type CreatedAppLifecycle = 'draft' | 'generating' | 'preview' | 'published' | 'updated' | 'archived';

export interface CreatedApp {
  id: string;
  name: string;
  requirement: string;
  modules: string[];
  lifecycle: CreatedAppLifecycle;
  createdAt: string;
  updatedAt: string;
  versions: string[];
  icon: string;
}

export interface AppCategory {
  id: string;
  labelKey: string;
  icon: string;
}

export interface AppRecommendation {
  app: WhatseekApp;
  /** Why the AI recommends this app for the expressed need. */
  reason: string;
}

/** PRD §26 contact kinds unified in the address book. */
export type ContactKind = 'person' | 'group' | 'org' | 'agent' | 'assistant';

export interface Contact {
  id: string;
  name: string;
  kind: ContactKind;
  bio: string;
  tags: string[];
  company?: string;
  /** Emoji avatar glyph with a deterministic hue per contact. */
  avatar: string;
}

export type ConversationKind = 'direct' | 'group' | 'system' | 'app' | 'agent' | 'task';

export interface Conversation {
  id: string;
  kind: ConversationKind;
  titleKey?: string;
  title?: string;
  contactId?: string;
  taskId?: string;
  unread: number;
  updatedAt: string;
  lastMessagePreview?: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  sentAt: string;
  kind: 'text' | 'system' | 'task';
}

/** PRD §41 task states. */
export type TaskState =
  | 'pending'
  | 'running'
  | 'waiting_confirmation'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'expired';

export interface WhatseekTask {
  id: string;
  title: string;
  intent: string;
  state: TaskState;
  createdAt: string;
  updatedAt: string;
  /** Payload delivered when the task completes (e.g. created app id). */
  resultSummary?: string;
  createdAppId?: string;
}

/** Chat entry card payloads rendered inside AI replies. */
export type ChatCard =
  | { type: 'app_results'; apps: AppRecommendation[] }
  | { type: 'app_plan'; title: string; modules: string[]; requirement: string }
  | { type: 'send_message_confirm'; contactId: string; contactName: string; draft: string }
  | { type: 'commerce_results'; domain: 'product' | 'supplier' | 'service'; items: CommerceResult[] }
  | { type: 'contact_results'; contacts: Contact[] };

export interface CommerceResult {
  id: string;
  title: string;
  subtitle: string;
  priceLabel: string;
}

export interface ChatReply {
  /** i18n key under `whatseek.chat.reply.*`; the UI translates it. */
  contentKey: string;
  /** Interpolation params for `contentKey`. */
  contentParams?: Record<string, unknown>;
  cards?: ChatCard[];
  taskId?: string;
}

/** PRD §10.1 core intents. */
export type WhatseekIntent =
  | 'SEARCH_APP'
  | 'USE_APP'
  | 'CREATE_APP'
  | 'SEARCH_AGENT'
  | 'USE_AGENT'
  | 'CREATE_AGENT'
  | 'SEARCH_PRODUCT'
  | 'SEARCH_SUPPLIER'
  | 'SEARCH_SERVICE'
  | 'SEARCH_PERSON'
  | 'SEND_MESSAGE'
  | 'CREATE_CONTENT'
  | 'EDIT_CONTENT'
  | 'EXECUTE_TASK'
  | 'GENERAL_CHAT';

export interface IntentResult {
  intent: WhatseekIntent;
  confidence: number;
  keywords: string[];
}

export interface SessionUser {
  id: string;
  name: string;
  avatar: string;
  isVisitor: boolean;
}
