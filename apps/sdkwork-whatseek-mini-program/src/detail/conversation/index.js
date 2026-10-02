const { appApi } = require('../../runtime/app.js');

Page({
  data: { messages: [], conversationId: '', input: '' },
  async onLoad(options) {
    this.setData({ conversationId: options.conversationId });
    await appApi.messages.markRead(options.conversationId);
    const messages = await appApi.messages.thread(options.conversationId);
    this.setData({ messages });
  },
  onInput(event) { this.setData({ input: event.detail.value }); },
  async onSend() {
    const content = this.data.input.trim();
    if (content.length === 0) return;
    const message = await appApi.messages.send(this.data.conversationId, content);
    this.setData({ messages: [...this.data.messages, message], input: '' });
  },
});
