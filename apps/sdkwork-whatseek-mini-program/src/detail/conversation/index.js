// 会话 — route id `app.whatseek.messages.conversation`. Thread view with
// markRead on entry, loading/empty/error states, and guarded send.
const { appApi } = require('../../runtime/app.js');

Page({
  data: {
    messages: [],
    conversationId: '',
    input: '',
    loading: true,
    error: '',
    sending: false,
  },

  onLoad(options) {
    const conversationId = typeof options.conversationId === 'string' ? options.conversationId : '';
    this.setData({ conversationId });
    this.load(conversationId);
  },

  async load(conversationId) {
    this.setData({ loading: true, error: '' });
    try {
      await appApi.messages.markRead(conversationId);
      const messages = await appApi.messages.thread(conversationId);
      this.setData({ messages, loading: false });
    } catch (error) {
      this.setData({ loading: false, error: '加载失败，请稍后重试。' });
    }
  },

  onRetry() {
    this.load(this.data.conversationId);
  },

  onInput(event) {
    this.setData({ input: event.detail.value });
  },

  async onSend() {
    const content = this.data.input.trim();
    if (content.length === 0 || this.data.sending) return;
    this.setData({ sending: true });
    try {
      const message = await appApi.messages.send(this.data.conversationId, content);
      this.setData({ messages: [...this.data.messages, message], input: '', sending: false });
    } catch (error) {
      this.setData({ sending: false });
      appApi.shell.toast('发送失败，请重试');
    }
  },
});
