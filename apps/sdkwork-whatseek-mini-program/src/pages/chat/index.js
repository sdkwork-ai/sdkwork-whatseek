// 对话 tab — AI chat entry (PRD §8/§9). Logic comes from the bundled runtime;
// this page layer only binds data and events (MINI_PROGRAM_APP_ARCHITECTURE_SPEC
// §Packages vs platform pages).
const { appApi } = require('../../runtime/app.js');

Page({
  data: {
    entries: [],
    input: '',
    sending: false,
    suggestionKeys: ['帮我找一个视频剪辑工具', '帮我做一个库存管理系统', '给张三发消息，告诉他下午三点开会', '找一个支持定制的手机壳供应商'],
  },

  onInput(event) {
    this.setData({ input: event.detail.value });
  },

  async onSuggestion(event) {
    await this.send(event.currentTarget.dataset.text);
  },

  async onSend() {
    const text = this.data.input.trim();
    if (text.length === 0 || this.data.sending) {
      return;
    }
    await this.send(text);
  },

  async send(text) {
    const entries = [...this.data.entries, { role: 'user', text }];
    this.setData({ entries, input: '', sending: true });
    try {
      const turn = await appApi.chat.send(text);
      this.setData({
        entries: [
          ...entries,
          { role: 'assistant', text: turn.replyText, cards: turn.cards, taskId: turn.taskId },
        ],
        sending: false,
      });
    } catch (error) {
      this.setData({
        entries: [...entries, { role: 'assistant', text: '出了点问题，请重试。' }],
        sending: false,
      });
    }
  },

  async onAction(event) {
    const { kind, contactid, contactname, draft, requirement } = event.currentTarget.dataset;
    const action =
      kind === 'generate'
        ? { kind: 'generate_app', requirement, modules: [] }
        : { kind: 'confirm_send_message', contactId: contactid, contactName: contactname, draft };
    try {
      const message = await appApi.chat.runAction(action);
      this.setData({
        entries: [...this.data.entries, { role: 'assistant', text: message }],
      });
    } catch (error) {
      appApi.shell; // runtime present; show the failure inline
      this.setData({
        entries: [...this.data.entries, { role: 'assistant', text: '操作失败，请重试。' }],
      });
    }
  },
});
