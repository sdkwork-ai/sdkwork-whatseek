// 应用运行 — route id `app.whatseek.apps.runner`. Loads the app, records the
// recent use, and renders the Phase-1 runtime preview. Enterprise apps require
// a named session: visitors get the genuine permission-denied state.
const { appApi } = require('../../runtime/app.js');

Page({
  data: {
    app: null,
    appName: '',
    loading: true,
    error: '',
    denied: false,
  },

  onLoad(options) {
    this.appId = typeof options.appId === 'string' ? options.appId : '';
    this.load();
  },

  async load() {
    this.setData({ loading: true, error: '', denied: false });
    try {
      const app = await appApi.apps.detail(this.appId);
      if (app === null) {
        this.setData({ loading: false, error: '应用不存在或已下架。' });
        return;
      }
      if (app.kind === 'enterprise' && appApi.profile.getSession().isVisitor) {
        // Visitor sessions cannot open enterprise apps (mock IAM, Phase 2
        // swaps in the generated IAM client — the port stays identical).
        // Sign in from the profile tab, then reopen: the gate is a real loop.
        this.setData({ loading: false, denied: true, appName: app.name });
        return;
      }
      await appApi.apps.open(app.id);
      this.setData({ app, loading: false });
    } catch (error) {
      this.setData({ loading: false, error: '应用打开失败，请稍后重试。' });
    }
  },

  onRetry() {
    this.load();
  },

  onBack() {
    wx.navigateBack({ delta: 1 });
  },
});
