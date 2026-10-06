// 应用搜索 — route id `app.whatseek.apps.search`. Logic comes from the bundled
// runtime; this page layer only binds data and events and owns the
// loading/empty/error states (APP_MINI_PROGRAM_UI_SPEC §UI states).
const { appApi } = require('../../runtime/app.js');

Page({
  data: {
    query: '',
    results: [],
    searched: false,
    loading: false,
    error: '',
    t: {},
    c: {},
  },

  onLoad(options) {
    const query = typeof options.query === 'string' ? options.query : '';
    this.setData({ query });
    if (query.trim().length > 0) {
      this.search(query.trim());
    }
  },

  onShow() {
    this.applyStrings();
  },

  applyStrings() {
    this.setData({ t: appApi.apps.strings(), c: appApi.commons.strings() });
  },

  onQueryInput(event) {
    this.setData({ query: event.detail.value });
  },

  onSearch() {
    const query = this.data.query.trim();
    if (query.length === 0 || this.data.loading) return;
    this.search(query);
  },

  async search(query) {
    this.setData({ loading: true, error: '' });
    try {
      const results = await appApi.apps.search(query);
      this.setData({ results, searched: true, loading: false });
    } catch (error) {
      this.setData({ loading: false, error: appApi.apps.strings().search.failedDesc });
    }
  },

  onRetry() {
    const query = this.data.query.trim();
    if (query.length > 0) {
      this.search(query);
    }
  },

  async onPullDownRefresh() {
    const query = this.data.query.trim();
    if (query.length > 0) {
      await this.search(query);
    }
    wx.stopPullDownRefresh();
  },

  onResultTap(event) {
    const appId = event.currentTarget.dataset.id;
    appApi.shell.navigate(`/detail/apps-detail/index?appId=${appId}`);
  },
});
