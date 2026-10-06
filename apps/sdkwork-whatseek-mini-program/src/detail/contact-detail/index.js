// 联系人详情 — route id `app.whatseek.contacts.detail`. Renders the contact
// card and opens the direct conversation (shared MessagesPort).
const { appApi } = require('../../runtime/app.js');

Page({
  data: {
    contact: null,
    kindLabel: '',
    loading: true,
    error: '',
    opening: false,
    t: {},
    c: {},
  },

  onLoad(options) {
    this.contactId = typeof options.contactId === 'string' ? options.contactId : '';
    this.load();
  },

  onShow() {
    this.applyStrings();
  },

  applyStrings() {
    this.setData({ t: appApi.contacts.strings(), c: appApi.commons.strings() });
  },

  async load() {
    this.setData({ loading: true, error: '' });
    try {
      const contact = await appApi.contacts.detail(this.contactId);
      if (contact === null) {
        this.setData({ loading: false, error: appApi.contacts.strings().detail.notFound });
        return;
      }
      this.setData({ contact, kindLabel: appApi.contacts.kindLabel(contact.kind), loading: false });
    } catch (error) {
      this.setData({ loading: false, error: appApi.commons.strings().state.loadFailedDesc });
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
      appApi.shell.toast(appApi.contacts.strings().detail.openFailedToast);
    }
  },
});
