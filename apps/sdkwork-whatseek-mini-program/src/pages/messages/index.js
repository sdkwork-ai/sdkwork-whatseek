// 消息 tab — route id `app.whatseek.messages.home`. Conversation list with
// loading/empty/error states and unread badges; rows open the thread page.
const { appApi } = require('../../runtime/app.js');

Page({
  data: {
    conversations: [],
    loading: true,
    error: '',
    t: {},
    c: {},
  },

  onShow() {
    this.applyStrings();
    this.load();
  },

  applyStrings() {
    this.setData({ t: appApi.messages.strings(), c: appApi.commons.strings() });
  },

  async load(options = {}) {
    const silent = options.silent === true;
    this.setData(silent ? { error: '' } : { loading: true, error: '' });
    try {
      const conversations = await appApi.messages.conversations();
      this.setData({ conversations, loading: false });
    } catch (error) {
      this.setData({ loading: false, error: appApi.commons.strings().state.loadFailedDesc });
    }
  },

  async onPullDownRefresh() {
    await this.load({ silent: true });
    wx.stopPullDownRefresh();
  },

  onRetry() {
    this.load();
  },

  onConversationTap(event) {
    const id = event.currentTarget.dataset.id;
    appApi.shell.navigate('/detail/conversation/index?conversationId=' + id);
  },
});
