/**
 * Keyword extraction for natural-language app search (PRD §32: keyword,
 * natural language, task, and multi-condition searches all funnel here in
 * Phase 1). Pure and locale-aware for zh-CN + en-US.
 */

const STOPWORDS: readonly string[] = [
  '帮我',
  '找一个',
  '找一下',
  '找一个',
  '想要',
  '需要',
  '有没有',
  '推荐',
  '适合',
  '支持',
  '可以',
  '一个',
  '一款',
  '工具',
  '软件',
  '应用',
  '的',
  '了',
  '吗',
  '呢',
  '和',
  '跟',
  '与',
  '还有',
  'please',
  'find',
  'search',
  'look',
  'for',
  'want',
  'need',
  'recommend',
  'suitable',
  'tool',
  'software',
  'application',
  'app',
  'a',
  'an',
  'the',
  'me',
  'my',
  'with',
  'that',
];

export function extractSearchKeywords(query: string): string[] {
  const normalized = query.toLowerCase().trim();
  if (normalized.length === 0) {
    return [];
  }
  const segments = normalized
    .split(/[\s,，。.、;；!！?？/\\]+/u)
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0);
  const keywords: string[] = [];
  for (const segment of segments) {
    let remaining = segment;
    for (const stopword of STOPWORDS) {
      remaining = remaining.split(stopword).join(' ');
    }
    for (const token of remaining.split(/\s+/u)) {
      if (token.length > 0 && !keywords.includes(token)) {
        keywords.push(token);
      }
    }
  }
  return keywords;
}

export interface ScoredApp<T extends WhatseekAppLike = WhatseekAppLike> {
  app: T;
  score: number;
  matchedOn: string;
}

export interface WhatseekAppLike {
  id: string;
  name: string;
  summary: string;
  category: string;
  tags: readonly string[];
}

/**
 * Score one app against extracted keywords. Name hits weigh most, then tags,
 * then summary/category. Multi-keyword overlap accumulates.
 */
export function scoreAppForKeywords<T extends WhatseekAppLike>(app: T, keywords: readonly string[]): ScoredApp<T> | null {
  let score = 0;
  let matchedOn = '';
  const name = app.name.toLowerCase();
  const summary = app.summary.toLowerCase();
  const category = app.category.toLowerCase();
  for (const keyword of keywords) {
    if (name.includes(keyword)) {
      score += 6;
      matchedOn = matchedOn.length === 0 ? keyword : matchedOn;
    }
    for (const tag of app.tags) {
      const lowerTag = tag.toLowerCase();
      if (lowerTag.includes(keyword) || keyword.includes(lowerTag)) {
        score += 4;
        if (matchedOn.length === 0) {
          matchedOn = tag;
        }
      }
    }
    if (summary.includes(keyword)) {
      score += 2;
      if (matchedOn.length === 0) {
        matchedOn = keyword;
      }
    }
    if (category.includes(keyword)) {
      score += 2;
      if (matchedOn.length === 0) {
        matchedOn = keyword;
      }
    }
  }
  return score > 0 ? { app, score, matchedOn } : null;
}
