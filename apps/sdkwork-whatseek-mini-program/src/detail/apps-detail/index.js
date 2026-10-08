// 应用详情 — route id `app.whatseek.apps.detail`. Detail card with real
// favorite toggle (shared AppsPort) and the runner entry. Static chrome
// strings bind through `appApi.apps.strings()` and re-apply in onShow.
const { appApi } = require('../../runtime/app.js');

Page({
  data: {
    similar: [],
    reviews: [],
    myRating: 0,
    developerApps: [],
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
      const [app, similarApps, developerApps, reviews, favorites] = await Promise.all([
        appApi.apps.detail(this.appId),
        appApi.apps.similarApps(this.appId),
        appApi.apps.reviews(this.appId),
        appApi.apps.developerApps(this.appId),
        appApi.apps.favorites(),
      ]);
      if (app === null) {
        this.setData({ loading: false, error: appApi.apps.strings().detail.notFound });
        return;
      }
      this.setData({
        app,
        similar: similarApps,
        reviews,
        developerApps,
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

  onRateTap(event) {
    const star = Number(event.currentTarget.dataset.star);
    if (!(star >= 1 && star <= 5)) {
      return;
    }
    this.setData({ myRating: star });
    appApi.apps
      .rate(this.appId, star)
      .then(() => appApi.apps.reviews(this.appId))
      .then((reviews) => {
        this.setData({ reviews });
      })
      .catch(() => undefined);
  },
  onSimilarTap(event) {
    const appId = event.currentTarget.dataset.id;
    this.setData({ similar: [], reviews: [], developerApps: [] });
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
