// 应用 tab — route id `app.whatseek.apps.home`. Recommended list + category
// chips; search and creation delegate to their dedicated detail pages
// (app.whatseek.apps.search / app.whatseek.apps.create).
const { appApi } = require('../../runtime/app.js');

Page({
  data: {
    recommended: [],
    categories: [],
    hot: [],
    recents: [],
    query: '',
    loading: true,
    error: '',
  },

  onShow() {
    this.load();
  },

  async load(options = {}) {
    const silent = options.silent === true;
    this.setData(silent ? { error: '' } : { loading: true, error: '' });
    try {
      const [recommended, categories, hot, recents] = await Promise.all([
        appApi.apps.recommended(),
        appApi.apps.categories(),
        appApi.apps.hot(),
        appApi.apps.recents(),
      ]);
      this.setData({ recommended, categories, hot, recents, loading: false });
    } catch (error) {
      this.setData({ loading: false, error: '加载失败，请稍后重试。' });
    }
  },

  async onPullDownRefresh() {
    await this.load({ silent: true });
    wx.stopPullDownRefresh();
  },

  onRetry() {
    this.load();
  },

  onQueryInput(event) {
    this.setData({ query: event.detail.value });
  },

  onSearch() {
    const query = this.data.query.trim();
    if (query.length === 0) return;
    appApi.shell.navigate(`/detail/apps-search/index?query=${encodeURIComponent(query)}`);
  },

  onCategoryTap(event) {
    const categoryId = event.currentTarget.dataset.id;
    appApi.shell.navigate(`/detail/apps-search/index?query=${encodeURIComponent(categoryId)}`);
  },

  onCreate() {
    appApi.shell.navigate('/detail/apps-create/index');
  },

  onMyApps() {
    appApi.shell.navigate('/detail/apps-my/index');
  },
});
