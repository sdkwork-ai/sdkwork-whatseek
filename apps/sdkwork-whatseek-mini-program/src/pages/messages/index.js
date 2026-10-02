const { appApi } = require('../../runtime/app.js');

Page({
  data: { conversations: [], loading: true },
  async onShow() {
    const conversations = await appApi.messages.conversations();
    this.setData({ conversations, loading: false });
  },
  onConversationTap(event) {
    const id = event.currentTarget.dataset.id;
    wx.navigateTo({ url: '/detail/conversation/index?conversationId=' + id });
  },
});
