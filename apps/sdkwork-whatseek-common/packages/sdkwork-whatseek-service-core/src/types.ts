/**
 * Shared domain model for the WhatSeek (问寻) super app.
 *
 * These types are the cross-capability contract: capability packages depend on
 * them; the concrete data behind them arrives through the SDK ports in
 * `sdk/ports.ts` (mock clients in Phase 1, generated SDK clients in Phase 2).
 * Cross-surface vocabulary (tab ids, intents) is owned by the shared package
 * family and re-exported here.
 */

export type { TabId } from '@sdkwork/whatseek-route-core';
export type { IntentResult, WhatseekIntent } from '@sdkwork/whatseek-intent-core';

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

/**
 * Appstore-style home feed blocks (sdkwork-appstore PRD §4.2.1 首页编辑流 /
 * §5.1 首页), served by the 应用 tab root. Editorial content is Phase 1 mock
 * data seeded alongside the catalog; Phase 2 swaps in the appstore catalog SDK.
 */
export type AppChartId = 'hot' | 'free' | 'new';

export interface AppHeroSlide {
  id: string;
  /** Editorial campaign headline. */
  title: string;
  /** One-line tagline under the headline. */
  tagline: string;
  /** Small badge label, e.g. 编辑推荐. */
  badge: string;
  /** Featured app the slide opens. */
  appId: string;
  icon: string;
}

export interface AppStoryCard {
  id: string;
  title: string;
  subtitle: string;
  /** App the story links to. */
  appId: string;
  icon: string;
}

export type AppCollectionKind = 'editorial' | 'chart' | 'theme' | 'event';

export interface AppCollection {
  id: string;
  title: string;
  description: string;
  kind: AppCollectionKind;
  appIds: string[];
}

/** Home-feed collection card with cover apps already resolved. */
export interface AppCollectionCard {
  id: string;
  title: string;
  description: string;
  kind: AppCollectionKind;
  /** Cover apps for the card's mini icon grid (up to four). */
  coverApps: WhatseekApp[];
}

/** One chart's quick view on the home feed (top entries only). */
export interface AppChartPreview {
  id: AppChartId;
  apps: WhatseekApp[];
}

export interface AppHomeFeed {
  heroes: AppHeroSlide[];
  stories: AppStoryCard[];
  collections: AppCollectionCard[];
  charts: AppChartPreview[];
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
  /** App update/install notifications carry the originating app id. */
  appId?: string;
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
  | { type: 'app_plan'; title: string; modules: string[]; pages: string[]; dataModel: string[]; requirement: string }
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

export interface SessionUser {
  id: string;
  name: string;
  avatar: string;
  isVisitor: boolean;
}
