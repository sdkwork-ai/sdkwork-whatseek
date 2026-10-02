// 应用详情 — route id `app.whatseek.apps.detail`. Detail card with real
// favorite toggle (shared AppsPort) and the runner entry.
const { appApi } = require('../../runtime/app.js');

Page({
  data: {
    app: null,
    loading: true,
    error: '',
    favorite: false,
    favoriting: false,
  },

  onLoad(options) {
    this.appId = typeof options.appId === 'string' ? options.appId : '';
    this.load();
  },

  async load() {
    this.setData({ loading: true, error: '' });
    try {
      const [app, favorites] = await Promise.all([
        appApi.apps.detail(this.appId),
        appApi.apps.favorites(),
      ]);
      if (app === null) {
        this.setData({ loading: false, error: '应用不存在或已下架。' });
        return;
      }
      this.setData({
        app,
        favorite: favorites.some((favorite) => favorite.id === app.id),
        loading: false,
      });
    } catch (error) {
      this.setData({ loading: false, error: '加载失败，请稍后重试。' });
    }
  },

  onRetry() {
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
      appApi.shell.toast(favorite ? '已收藏' : '已取消收藏');
    } catch (error) {
      this.setData({ favoriting: false });
      appApi.shell.toast('操作失败，请重试');
    }
  },
});
