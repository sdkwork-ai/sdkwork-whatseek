import { describe, expect, it } from 'vitest';

import { createMockAppsClient } from '../src/services/appsClient.js';
import { extractSearchKeywords, scoreAppForKeywords } from '../src/services/search.js';

function memoryStorage(): { getItem: (key: string) => string | null; setItem: (key: string, value: string) => void; removeItem: (key: string) => void } {
  const map = new Map<string, string>();
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => {
      map.set(key, value);
    },
    removeItem: (key) => {
      map.delete(key);
    },
  };
}

describe('extractSearchKeywords', () => {
  it('strips_zh_cn_stopwords_and_keeps_domain_tokens', () => {
    expect(extractSearchKeywords('帮我找一个视频剪辑工具')).toEqual(['视频剪辑']);
  });

  it('keeps_multiple_tokens_for_multi_condition_queries', () => {
    const keywords = extractSearchKeywords('适合 20 人销售团队的客户管理工具');
    expect(keywords).toContain('20');
    expect(keywords).toContain('人销售团队');
    expect(keywords).toContain('客户管理');
  });

  it('returns_empty_for_a_stopword_only_query', () => {
    expect(extractSearchKeywords('帮我找一个工具')).toEqual([]);
  });
});

describe('scoreAppForKeywords', () => {
  const app = {
    id: 'clip-master',
    name: '剪辑大师',
    summary: '智能视频剪辑：自动粗剪、字幕、配乐。',
    category: 'video',
    tags: ['视频剪辑', '字幕', '粗剪'],
  };

  it('ranks_name_and_tag_hits_above_zero', () => {
    const scored = scoreAppForKeywords(app, ['视频剪辑']);
    expect(scored).not.toBeNull();
    expect(scored?.score).toBeGreaterThan(0);
    expect(scored?.matchedOn).toBe('视频剪辑');
  });

  it('returns_null_when_nothing_matches', () => {
    expect(scoreAppForKeywords(app, ['会计'])).toBeNull();
  });
});

describe('mock apps client', () => {
  it('finds_a_video_app_for_the_prd_search_example', async () => {
    const client = createMockAppsClient({ storage: memoryStorage() });
    const results = await client.searchApps('帮我找一个视频剪辑工具');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]?.app.name).toBe('剪辑大师');
  });

  it('finds_the_crm_app_for_a_natural_language_query', async () => {
    const client = createMockAppsClient({ storage: memoryStorage() });
    const results = await client.searchApps('适合20人销售团队的客户管理工具');
    expect(results.some((entry) => entry.app.id === 'crm-manager')).toBe(true);
  });

  it('returns_empty_results_for_unmatchable_queries', async () => {
    const client = createMockAppsClient({ storage: memoryStorage() });
    const results = await client.searchApps('量子折叠包装机');
    expect(results).toEqual([]);
  });

  it('drafts_a_crm_creation_plan_with_prd_modules', () => {
    const client = createMockAppsClient({ storage: memoryStorage() });
    const plan = client.draftCreationPlan('跨境客户管理系统');
    expect(plan.modules).toEqual(
      expect.arrayContaining(['客户列表', '客户详情', '跟进记录', '标签', '数据统计']),
    );
  });

  it('creates_previews_modifies_and_publishes_a_generated_app', async () => {
    const client = createMockAppsClient({ storage: memoryStorage() });
    const plan = client.draftCreationPlan('帮我创建一个库存管理系统');
    const created = await client.createAppFromPlan('帮我创建一个库存管理系统', plan.modules);
    expect(created.lifecycle).toBe('preview');
    expect(created.modules).toContain('库存盘点');

    const modified = await client.modifyApp(created.id, '增加订单管理');
    expect(modified.versions.length).toBe(2);

    const published = await client.publishApp(created.id);
    expect(published.lifecycle).toBe('published');

    const myApps = await client.listMyApps();
    expect(myApps.some((app) => app.id === created.id)).toBe(true);
  });

  it('records_and_lists_recent_apps', async () => {
    const client = createMockAppsClient({ storage: memoryStorage() });
    await client.recordRecent('clip-master');
    await client.recordRecent('image-studio');
    const recent = await client.listRecent();
    expect(recent.map((app) => app.id)).toEqual(['image-studio', 'clip-master']);
  });

  it('toggles_favorites', async () => {
    const client = createMockAppsClient({ storage: memoryStorage() });
    expect(await client.toggleFavorite('clip-master')).toBe(true);
    expect((await client.listFavorites()).map((app) => app.id)).toContain('clip-master');
    expect(await client.toggleFavorite('clip-master')).toBe(false);
    expect(await client.listFavorites()).toEqual([]);
  });
});

describe('appstore home feed', () => {
  it('serves_heroes_stories_collections_and_chart_previews', async () => {
    const client = createMockAppsClient({ storage: memoryStorage() });
    const feed = await client.listHomeFeed();
    expect(feed.heroes.length).toBeGreaterThanOrEqual(2);
    expect(feed.stories.length).toBeGreaterThanOrEqual(2);
    expect(feed.collections.length).toBeGreaterThanOrEqual(2);
    expect(feed.collections[0]?.coverApps.length).toBeGreaterThan(0);
    expect(feed.charts.map((chart) => chart.id)).toEqual(['hot', 'free', 'new']);
    for (const chart of feed.charts) {
      expect(chart.apps.length).toBeGreaterThan(0);
      expect(chart.apps.length).toBeLessThanOrEqual(3);
    }
  });

  it('ranks_hot_by_users_free_by_rating_and_new_by_recency', async () => {
    const client = createMockAppsClient({ storage: memoryStorage() });

    const hot = await client.listChart('hot');
    expect(hot[0]?.id).toBe('game-center');

    const free = await client.listChart('free');
    expect(free.length).toBeGreaterThan(0);
    for (const app of free) {
      expect(app.priceLabel).toBe('免费');
    }
    expect(free[0]?.rating).toBe(Math.max(...free.map((app) => app.rating)));

    const newest = await client.listChart('new');
    expect(newest[0]?.id).toBe('code-mate');
    const timestamps = newest.map((app) => app.updatedAt);
    expect(timestamps).toEqual([...timestamps].sort((left, right) => right.localeCompare(left)));
  });

  it('resolves_a_collection_with_its_curated_apps', async () => {
    const client = createMockAppsClient({ storage: memoryStorage() });
    const collection = await client.getCollection('col-efficiency-picks');
    expect(collection?.title).toBe('提升效率的 6 款工具');

    const apps = await client.listCollectionApps('col-efficiency-picks');
    expect(apps.map((app) => app.id)).toEqual([
      'schedule-pro',
      'meeting-notes',
      'audio-scribe',
      'study-notes',
      'code-mate',
      'data-board',
    ]);

    expect(await client.getCollection('missing-collection')).toBeNull();
    expect(await client.listCollectionApps('missing-collection')).toEqual([]);
  });
});
