import { describe, expect, it } from 'vitest';

import { recognizeIntent } from '../src/recognizer.js';

describe('intent recognition (PRD §10.2 examples)', () => {
  it('maps_帮我找一个视频剪辑工具_to_SEARCH_APP', () => {
    expect(recognizeIntent('帮我找一个视频剪辑工具').intent).toBe('SEARCH_APP');
  });

  it('maps_帮我做一个视频剪辑工具_to_CREATE_APP', () => {
    expect(recognizeIntent('帮我做一个视频剪辑工具').intent).toBe('CREATE_APP');
  });

  it('maps_找一个支持定制的手机壳供应商_to_SEARCH_SUPPLIER', () => {
    expect(recognizeIntent('找一个支持定制的手机壳供应商').intent).toBe('SEARCH_SUPPLIER');
  });

  it('maps_给张三发消息_to_SEND_MESSAGE_and_captures_the_name', () => {
    const result = recognizeIntent('给张三发消息，告诉他下午三点开会');
    expect(result.intent).toBe('SEND_MESSAGE');
    expect(result.keywords).toContain('张三');
  });
});

describe('intent recognition (remaining PRD §10.1 intents)', () => {
  it('recognizes_CREATE_APP_for_a_CRM_request', () => {
    expect(recognizeIntent('给我创建一个客户管理系统').intent).toBe('CREATE_APP');
  });

  it('recognizes_SEARCH_PERSON', () => {
    expect(recognizeIntent('找一下张三').intent).toBe('SEARCH_PERSON');
  });

  it('recognizes_CREATE_AGENT', () => {
    expect(recognizeIntent('创建一个每天帮我整理行业新闻的 Agent').intent).toBe('CREATE_AGENT');
  });

  it('recognizes_SEARCH_AGENT', () => {
    expect(recognizeIntent('帮我找一个可以完成这个任务的智能体').intent).toBe('SEARCH_AGENT');
  });

  it('recognizes_SEARCH_PRODUCT', () => {
    expect(recognizeIntent('我要采购1000件黑色T恤').intent).toBe('SEARCH_PRODUCT');
  });

  it('recognizes_SEARCH_SERVICE', () => {
    expect(recognizeIntent('帮我找一个靠谱的外包服务商').intent).toBe('SEARCH_SERVICE');
  });

  it('recognizes_CREATE_CONTENT', () => {
    expect(recognizeIntent('帮我做一张商品海报').intent).toBe('CREATE_CONTENT');
  });

  it('recognizes_EDIT_CONTENT', () => {
    expect(recognizeIntent('帮我把这张图片换成一个商品海报').intent).toBe('EDIT_CONTENT');
  });

  it('falls_back_to_GENERAL_CHAT_for_small_talk', () => {
    const result = recognizeIntent('今天天气怎么样？');
    expect(result.intent).toBe('GENERAL_CHAT');
    expect(result.confidence).toBeLessThan(0.5);
  });

  it('falls_back_to_GENERAL_CHAT_for_empty_input', () => {
    expect(recognizeIntent('   ').intent).toBe('GENERAL_CHAT');
  });
});
