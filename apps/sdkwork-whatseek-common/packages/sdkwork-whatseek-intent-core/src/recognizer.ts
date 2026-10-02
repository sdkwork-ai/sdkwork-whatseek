/**
 * Rule-based intent recognition over the PRD §10.1 core intent set
 * (Phase 1). Pure function: input text → intent + confidence + matched
 * keywords. Patterns are ordered — more specific intents win over generic
 * ones; CREATE beats SEARCH for the same noun (PRD §10.2: 找 vs 做).
 */

import type { IntentResult, WhatseekIntent } from './types.js';

interface IntentRule {
  intent: WhatseekIntent;
  /** Ordered patterns; first hit wins within the rule. */
  patterns: readonly RegExp[];
  confidence: number;
  /** Group index (1-based) whose capture becomes the matched keyword. */
  keywordGroup?: number;
}

const RULES: readonly IntentRule[] = [
  {
    intent: 'SEND_MESSAGE',
    patterns: [
      /(?:给|替)([\u4e00-\u9fa5a-zA-Z0-9]{2,8})(?:发|送|说|留言)/u,
      /帮(?:我)?(?:给)?([\u4e00-\u9fa5a-zA-Z0-9]{2,8})(?:发消息|发个消息|发送|发信息|说)/u,
      /联系(?:一下)?([\u4e00-\u9fa5a-zA-Z0-9]{2,8})/u,
      /(发消息|发个消息|发送消息|发信息|send (?:a )?message)/iu,
    ],
    confidence: 0.9,
    keywordGroup: 1,
  },
  {
    intent: 'SEARCH_SUPPLIER',
    patterns: [/(供应商|供货商|supplier)/iu],
    confidence: 0.9,
  },
  {
    intent: 'SEARCH_PRODUCT',
    patterns: [
      /((?:找|采购|进|买|批发)[\u4e00-\u9fa5]{0,12}(?:商品|货|产品|原料))|(商品|产品)搜索/u,
      /(采购|批发|进货)/u,
    ],
    confidence: 0.8,
  },
  {
    intent: 'SEARCH_SERVICE',
    patterns: [/(服务商|外包|找.{0,6}服务|service provider)/iu],
    confidence: 0.8,
  },
  {
    intent: 'CREATE_AGENT',
    patterns: [/(?:创建|做一个|做个|生成|开发|搭)(?:一个|个)?[\s\S]{0,20}(agent|智能体|数字员工|自动化助手)/iu],
    confidence: 0.9,
  },
  {
    // USE_AGENT must precede SEARCH_AGENT: SEARCH_AGENT's bare-term branch
    // would otherwise swallow 派/让/用 + agent utterances (PRD §10.2).
    intent: 'USE_AGENT',
    patterns: [
      /(?:让|派|用)(?:一个|个|这个|那个)?[\s\S]{0,12}(?:agent|智能体|数字员工|AI 助手)(?:帮我|来|去)?/iu,
      /(?:帮我用|派个)(?:agent|智能体|数字员工)/iu,
    ],
    confidence: 0.8,
  },
  {
    intent: 'SEARCH_AGENT',
    patterns: [
      /((?:找|找一个|找个|推荐)(?:一个)?[\s\S]{0,16}(?:agent|智能体|数字员工))|(agent|智能体)/iu,
    ],
    confidence: 0.8,
  },
  {
    intent: 'CREATE_APP',
    patterns: [
      /(?:创建|做一个|做个|生成|开发|搭建|制作|写)(?:一个|个)?[\s\S]{0,16}(系统|应用|软件|网站|小程序|平台|app|工具|管理)/iu,
    ],
    confidence: 0.9,
  },
  {
    intent: 'CREATE_CONTENT',
    patterns: [
      /(?:生成|做|创建|写|画|拍)(?:一个|一张|一段|一篇|个|张|段|篇)?[\s\S]{0,12}(海报|图片|视频|文章|标题|文案|logo|插图|封面)/iu,
    ],
    confidence: 0.85,
  },
  {
    intent: 'EDIT_CONTENT',
    patterns: [
      /((?:修改|编辑|改成|换|调整)(?:一下)?[\s\S]{0,10}(?:图片|视频|文章|文案|标题|内容))|(把这张|把那个)/u,
    ],
    confidence: 0.8,
  },
  {
    intent: 'USE_APP',
    patterns: [/((?:打开|运行|启动|使用)[\s\S]{0,8}(?:应用|app|软件|工具))|(打开[\s\S]{1,10})/iu],
    confidence: 0.75,
  },
  {
    intent: 'SEARCH_APP',
    patterns: [
      /(?:找|找找|找一个|找个|搜|搜索|推荐|有没有|想要|需要)(?:一个|个)?[\s\S]{0,12}(?:工具|应用|软件|app|平台)/iu,
      /(视频剪辑|图片编辑|标题生成|选品|剪辑|设计|记账|笔记|看板|crm|进销存)/iu,
    ],
    confidence: 0.85,
  },
  {
    intent: 'SEARCH_PERSON',
    patterns: [/(?:找|查|搜)(?:一下|找)?(?:联系人|张三|李四|王五|赵六)/u, /联系人查找/u],
    confidence: 0.8,
  },
  {
    intent: 'EXECUTE_TASK',
    patterns: [/(执行|帮我跑|跑一下|自动化)[\s\S]{0,10}/u],
    confidence: 0.7,
  },
];

/**
 * Recognize the PRD intent for one user utterance. Always resolves —
 * GENERAL_CHAT is the fallback (confidence 0.4).
 */
export function recognizeIntent(text: string): IntentResult {
  const input = text.trim();
  if (input.length === 0) {
    return { intent: 'GENERAL_CHAT', confidence: 0.4, keywords: [] };
  }
  for (const rule of RULES) {
    for (const pattern of rule.patterns) {
      const match = pattern.exec(input);
      if (match !== null) {
        const keyword =
          rule.keywordGroup !== undefined ? (match[rule.keywordGroup] ?? '') : (match[1] ?? match[0] ?? '');
        return {
          intent: rule.intent,
          confidence: rule.confidence,
          keywords: keyword.length > 0 ? [keyword] : [],
        };
      }
    }
  }
  return { intent: 'GENERAL_CHAT', confidence: 0.4, keywords: [] };
}
