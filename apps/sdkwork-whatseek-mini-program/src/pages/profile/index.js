// 我的 tab — route id `app.whatseek.profile.home`. Session card + asset
// summary + entries to 我的应用 / 设置 (app.whatseek.apps.my / profile.settings).
const { appApi } = require('../../runtime/app.js');

Page({
  data: {
    summary: null,
    loading: true,
    error: '',
  },

  onShow() {
    this.load();
  },

  async load() {
    this.setData({ loading: true, error: '' });
    try {
      const summary = await appApi.profile.summary();
      this.setData({ summary, loading: false });
    } catch (error) {
      this.setData({ loading: false, error: '加载失败，请稍后重试。' });
    }
  },

  onRetry() {
    this.load();
  },

  onMyApps() {
    appApi.shell.navigate('/detail/apps-my/index');
  },

  onSettings() {
    appApi.shell.navigate('/detail/settings/index');
  },
});
