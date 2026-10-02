const { appApi } = require('../../runtime/app.js');

Page({
  data: { contacts: [], loading: true },
  async onLoad() {
    const contacts = await appApi.contacts.search('');
    this.setData({ contacts, loading: false });
  },
});
