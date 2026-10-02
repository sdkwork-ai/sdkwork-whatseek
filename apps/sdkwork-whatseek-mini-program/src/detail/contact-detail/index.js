// 联系人详情 — route id `app.whatseek.contacts.detail`. Renders the contact
// card and opens the direct conversation (shared MessagesPort).
const { appApi } = require('../../runtime/app.js');

const KIND_LABELS = {
  person: '联系人',
  group: '群聊',
  org: '企业/组织',
  agent: 'Agent',
  assistant: 'AI 助手',
};

Page({
  data: {
    contact: null,
    kindLabel: '',
    loading: true,
    error: '',
    opening: false,
  },

  onLoad(options) {
    this.contactId = typeof options.contactId === 'string' ? options.contactId : '';
    this.load();
  },

  async load() {
    this.setData({ loading: true, error: '' });
    try {
      const contact = await appApi.contacts.detail(this.contactId);
      if (contact === null) {
        this.setData({ loading: false, error: '联系人不存在或已删除。' });
        return;
      }
      this.setData({ contact, kindLabel: KIND_LABELS[contact.kind] ?? contact.kind, loading: false });
    } catch (error) {
      this.setData({ loading: false, error: '加载失败，请稍后重试。' });
    }
  },

  onRetry() {
    this.load();
  },

  async onSendMessage() {
    if (this.data.opening) return;
    this.setData({ opening: true });
    try {
      const conversation = await appApi.messages.openDirect(this.contactId);
      this.setData({ opening: false });
      wx.redirectTo({ url: `/detail/conversation/index?conversationId=${conversation.id}` });
    } catch (error) {
      this.setData({ opening: false });
      appApi.shell.toast('会话打开失败，请重试');
    }
  },
});
