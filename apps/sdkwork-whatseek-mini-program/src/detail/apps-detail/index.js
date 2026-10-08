// 应用详情 — route id `app.whatseek.apps.detail`. Detail card with real
// favorite toggle (shared AppsPort) and the runner entry. Static chrome
// strings bind through `appApi.apps.strings()` and re-apply in onShow.
const { appApi } = require('../../runtime/app.js');

Page({
  data: {
    similar: [],
    app: null,
    loading: true,
    error: '',
    favorite: false,
    favoriting: false,
    t: {},
    c: {},
  },

  onLoad(options) {
    this.appId = typeof options.appId === 'string' ? options.appId : '';
    this.load();
  },

  onShow() {
    this.applyStrings();
  },

  applyStrings() {
    this.setData({ t: appApi.apps.strings(), c: appApi.commons.strings() });
  },

  async load() {
    this.setData({ loading: true, error: '' });
    try {
      const [app, similarApps, favorites] = await Promise.all([
        appApi.apps.detail(this.appId),
        appApi.apps.similarApps(this.appId),
        appApi.apps.favorites(),
      ]);
      if (app === null) {
        this.setData({ loading: false, error: appApi.apps.strings().detail.notFound });
        return;
      }
      this.setData({
        app,
        similar: similarApps,
        favorite: favorites.some((favorite) => favorite.id === app.id),
        loading: false,
      });
    } catch (error) {
      this.setData({ loading: false, error: appApi.commons.strings().state.loadFailedDesc });
    }
  },

  onRetry() {
    this.load();
  },

  onSimilarTap(event) {
    const appId = event.currentTarget.dataset.id;
    this.setData({ similar: [] });
    this.appId = appId;
    this.load();
  },

  onUse() {
    appApi.shell.navigate(`/detail/apps-runner/index?appId=${this.data.app.id}`);
  },

  async onFavorite() {
    if (this.data.favoriting) return;
    this.setData({ favoriting: true });
    try {
      const favorite = await appApi.apps.toggleFavorite(this.data.app.id);
      this.setData({ favorite, favoriting: false });
      appApi.shell.toast(favorite ? appApi.apps.strings().detail.addedToast : appApi.apps.strings().detail.removedToast);
    } catch (error) {
      this.setData({ favoriting: false });
      appApi.shell.toast(appApi.commons.strings().action.failed);
    }
  },
});
