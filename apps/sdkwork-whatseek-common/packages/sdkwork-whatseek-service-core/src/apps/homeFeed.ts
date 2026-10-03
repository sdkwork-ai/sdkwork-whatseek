import type {
  AppChartId,
  AppChartPreview,
  AppCollection,
  AppCollectionCard,
  AppHeroSlide,
  AppHomeFeed,
  AppStoryCard,
  WhatseekApp,
} from '../types.js';

import { WHATSEEK_CATALOG } from './catalog.js';

/**
 * Appstore-style home feed (sdkwork-appstore PRD §4.2.1 首页编辑流): hero
 * banner carousel → editorial story rail → curated collection rail → 为你推荐
 * grid → charts quick view. Hero/story/collection content is editorial seed
 * data over the Phase 1 catalog; charts derive from catalog metrics.
 */

export const WHATSEEK_HOME_HEROES: readonly AppHeroSlide[] = [
  {
    id: 'hero-ai-coding',
    title: 'AI 编程季',
    tagline: '从补全到单测，代码助手全程结对',
    badge: '编辑推荐',
    appId: 'code-mate',
    icon: '💻',
  },
  {
    id: 'hero-go-global',
    title: '出海工具箱',
    tagline: '选品、建站、内容营销一站式起步',
    badge: '专题',
    appId: 'cross-border-picker',
    icon: '🚢',
  },
  {
    id: 'hero-office-week',
    title: '高效办公周',
    tagline: '纪要、日程、看板，把重复工作交出去',
    badge: '限时活动',
    appId: 'meeting-notes',
    icon: '📝',
  },
] as const;

export const WHATSEEK_HOME_STORIES: readonly AppStoryCard[] = [
  {
    id: 'story-create-by-asking',
    title: '一句话，生成一个应用',
    subtitle: '看看问寻用户用 AI 造出了什么',
    appId: 'news-agent',
    icon: '🤖',
  },
  {
    id: 'story-short-video',
    title: '短视频团队的效率革命',
    subtitle: '剪辑、字幕、标题的全流程工具链',
    appId: 'clip-master',
    icon: '🎬',
  },
  {
    id: 'story-contract',
    title: '中小企业的法务外脑',
    subtitle: '合同审查从半天缩短到三分钟',
    appId: 'contract-review',
    icon: '📜',
  },
] as const;

export const WHATSEEK_HOME_COLLECTIONS: readonly AppCollection[] = [
  {
    id: 'col-efficiency-picks',
    title: '提升效率的 6 款工具',
    description: '从日程到纪要，把重复工作交给应用。',
    kind: 'editorial',
    appIds: ['schedule-pro', 'meeting-notes', 'audio-scribe', 'study-notes', 'code-mate', 'data-board'],
  },
  {
    id: 'col-go-global',
    title: '出海起步指南',
    description: '选品、建站、内容营销的入门组合。',
    kind: 'theme',
    appIds: ['cross-border-picker', 'site-builder', 'xhs-title'],
  },
  {
    id: 'col-business-suite',
    title: '小企业经营四件套',
    description: '客户、库存、账目、数据一处打理。',
    kind: 'editorial',
    appIds: ['crm-manager', 'stock-keeper', 'ledger-lite', 'data-board'],
  },
  {
    id: 'col-after-work',
    title: '下班后的第三空间',
    description: '探店、社群、棋牌，给生活留点空隙。',
    kind: 'theme',
    appIds: ['city-bites', 'interest-clubs', 'game-center'],
  },
] as const;

/** Entries shown in a home chart quick view; the charts screen lists all ten. */
export const HOME_CHART_PREVIEW_SIZE = 3;
export const CHART_SIZE = 10;

/** Parses `usersLabel` shapes like `9562` / `2.3万` into comparable counts. */
function parseUsersLabel(label: string): number {
  const match = /^([\d.]+)(万)?$/u.exec(label.trim());
  if (match === null) {
    return 0;
  }
  const value = Number.parseFloat(match[1] ?? '0');
  if (Number.isNaN(value)) {
    return 0;
  }
  return match[2] === undefined ? value : value * 10000;
}

export function listWhatseekChartApps(chartId: AppChartId, catalog: readonly WhatseekApp[] = WHATSEEK_CATALOG): WhatseekApp[] {
  switch (chartId) {
    case 'hot':
      return [...catalog]
        .sort((left, right) => parseUsersLabel(right.usersLabel) - parseUsersLabel(left.usersLabel))
        .slice(0, CHART_SIZE);
    case 'free':
      return catalog
        .filter((app) => app.priceLabel === '免费')
        .sort((left, right) => right.rating - left.rating)
        .slice(0, CHART_SIZE);
    case 'new':
      return [...catalog]
        .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
        .slice(0, CHART_SIZE);
  }
}

export function buildWhatseekHomeFeed(catalog: readonly WhatseekApp[] = WHATSEEK_CATALOG): AppHomeFeed {
  const charts: AppChartPreview[] = (['hot', 'free', 'new'] as const).map((id) => ({
    id,
    apps: listWhatseekChartApps(id, catalog).slice(0, HOME_CHART_PREVIEW_SIZE),
  }));
  const collections: AppCollectionCard[] = WHATSEEK_HOME_COLLECTIONS.map((collection) => ({
    id: collection.id,
    title: collection.title,
    description: collection.description,
    kind: collection.kind,
    coverApps: listWhatseekCollectionApps(collection.id, catalog).slice(0, 4),
  }));
  return {
    heroes: [...WHATSEEK_HOME_HEROES],
    stories: [...WHATSEEK_HOME_STORIES],
    collections,
    charts,
  };
}

export function findWhatseekCollection(collectionId: string): AppCollection | null {
  return WHATSEEK_HOME_COLLECTIONS.find((collection) => collection.id === collectionId) ?? null;
}

export function listWhatseekCollectionApps(
  collectionId: string,
  catalog: readonly WhatseekApp[] = WHATSEEK_CATALOG,
): WhatseekApp[] {
  const collection = findWhatseekCollection(collectionId);
  if (collection === null) {
    return [];
  }
  const appsById = new Map(catalog.map((app) => [app.id, app]));
  return collection.appIds
    .map((appId) => appsById.get(appId))
    .filter((app): app is WhatseekApp => app !== undefined);
}
