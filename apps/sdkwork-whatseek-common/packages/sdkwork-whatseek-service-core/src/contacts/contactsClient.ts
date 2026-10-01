/**
 * Standalone mock implementation of the core `ContactsPort` (PRD §26):
 * people, groups, organizations/merchants/suppliers, agents, and AI
 * assistants. In-memory seed data; Phase 2 swaps in the platform SDK client.
 */

import type { Contact, ContactKind } from '../types.js';
import type { ContactsPort } from '../ports.js';

const SEED_CONTACTS: readonly Contact[] = [
  { id: 'zhangsan', name: '张三', kind: 'person', bio: '产品经理 · 负责问寻应用中心', tags: ['同事', '产品'], company: '问寻', avatar: '🧑‍💼' },
  { id: 'lisi', name: '李四', kind: 'person', bio: '前端工程师 · H5 渲染层', tags: ['同事', '前端'], company: '问寻', avatar: '👩‍💻' },
  { id: 'wangwu', name: '王五', kind: 'person', bio: '采购负责人 · 华东区', tags: ['合作', '采购'], company: '出海优选', avatar: '🧑‍🌾' },
  { id: 'design-team', name: '设计团队', kind: 'group', bio: '问寻设计部 · 视觉与体验', tags: ['群组', '设计'], avatar: '🎨' },
  { id: 'prod-team', name: '产品交流群', kind: 'group', bio: 'AI 产品经理交流群', tags: ['群组', '产品'], avatar: '👥' },
  { id: 'supplier-jinshang', name: '上海锦裳服饰', kind: 'org', bio: 'T 恤/卫衣定制供应商 · 7 天打样', tags: ['供应商', '服饰'], company: '上海锦裳服饰有限公司', avatar: '🏭' },
  { id: 'supplier-haohan', name: '义乌皓瀚服饰', kind: 'org', bio: '现货混批 · 一件代发', tags: ['供应商', '现货'], company: '义乌市皓瀚服饰有限公司', avatar: '🏬' },
  { id: 'service-shoot', name: '光影摄影服务', kind: 'org', bio: '商品拍摄 · 白底图 48h 交付', tags: ['服务商', '摄影'], company: '光影文化传媒', avatar: '📷' },
  { id: 'agent-news', name: '行业新闻整理 Agent', kind: 'agent', bio: '每天 9:00 整理行业新闻摘要', tags: ['Agent', '新闻'], avatar: '🤖' },
  { id: 'agent-selection', name: '跨境选品 Agent', kind: 'agent', bio: '监控选品雷达并推送机会', tags: ['Agent', '电商'], avatar: '🛰️' },
  { id: 'whatseek-ai', name: '问寻 AI 助手', kind: 'assistant', bio: '你负责问，AI 负责寻', tags: ['AI', '官方'], avatar: '✨' },
] as const;

export interface MockContactsClientOptions {
  seed?: readonly Contact[];
}

export function createMockContactsClient(options: MockContactsClientOptions = {}): ContactsPort {
  const contacts: readonly Contact[] = options.seed ?? SEED_CONTACTS;

  const matches = (contact: Contact, query: string): boolean => {
    const lower = query.toLowerCase();
    return (
      contact.name.toLowerCase().includes(lower) ||
      contact.bio.toLowerCase().includes(lower) ||
      contact.tags.some((tag) => tag.toLowerCase().includes(lower)) ||
      (contact.company !== undefined && contact.company.toLowerCase().includes(lower))
    );
  };

  return {
    async listContacts() {
      return [...contacts];
    },
    async searchContacts(query) {
      const trimmed = query.trim();
      if (trimmed.length === 0) {
        return [...contacts];
      }
      return contacts.filter((contact) => matches(contact, trimmed));
    },
    async getContact(contactId) {
      return contacts.find((contact) => contact.id === contactId) ?? null;
    },
  };
}

export const CONTACT_KIND_ORDER: readonly ContactKind[] = [
  'person',
  'group',
  'org',
  'agent',
  'assistant',
];
