// 我的 tab — route id `app.whatseek.profile.home`. Session card + asset
// summary + entries to 我的应用 / 设置 (app.whatseek.apps.my / profile.settings).
const { appApi } = require('../../runtime/app.js');

Page({
  data: {
    summary: null,
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
    this.setData({ t: appApi.profile.strings(), c: appApi.commons.strings() });
  },

  async load() {
    this.setData({ loading: true, error: '' });
    try {
      const summary = await appApi.profile.summary();
      this.setData({ summary, loading: false });
    } catch (error) {
      this.setData({ loading: false, error: appApi.commons.strings().state.loadFailedDesc });
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

  async onSignIn() {
    appApi.profile.signIn();
    appApi.shell.toast(appApi.profile.strings().home.signedInToast);
    this.load();
  },

  async onSignOut() {
    appApi.profile.signOut();
    appApi.shell.toast(appApi.profile.strings().home.signedOutToast);
    this.load();
  },
});
