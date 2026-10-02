const { appApi } = require('../../runtime/app.js');

Page({
  data: { summary: null, loading: true },
  async onLoad() {
    const summary = await appApi.profile.summary();
    this.setData({ summary, loading: false });
  },
});
