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
    trending: [],
    suggestions: [],
    history: [],
    t: {},
    c: {},
  },

  onLoad(options) {
    const query = typeof options.query === 'string' ? options.query : '';
    this.setData({ query });
    if (query.trim().length > 0) {
      this.search(query.trim());
    } else {
      // 热搜 + 搜索历史 feed the empty-query state (appstore driver; empty
      // lists hide the sections on the mock driver).
      appApi.apps
        .trending()
        .then((trending) => {
          this.setData({ trending });
        })
        .catch(() => {
          this.setData({ trending: [] });
        });
      appApi.apps
        .history()
        .then((history) => {
          this.setData({ history });
        })
        .catch(() => {
          this.setData({ history: [] });
        });
    }
  },

  onShow() {
    this.applyStrings();
  },

  applyStrings() {
    this.setData({ t: appApi.apps.strings(), c: appApi.commons.strings() });
  },

  onQueryInput(event) {
    const draft = event.detail.value;
    this.setData({ query: draft });
    // Debounced server suggestions for the typed prefix (≥2 chars).
    if (this.suggestionTimer) {
      clearTimeout(this.suggestionTimer);
    }
    const trimmed = draft.trim();
    if (trimmed.length < 2 || trimmed === this.data.query.trim()) {
      if (this.data.suggestions.length > 0) {
        this.setData({ suggestions: [] });
      }
      return;
    }
    this.suggestionTimer = setTimeout(() => {
      appApi.apps
        .suggestions(trimmed)
        .then((suggestions) => {
          this.setData({ suggestions });
        })
        .catch(() => {
          this.setData({ suggestions: [] });
        });
    }, 250);
  },

  onSuggestionTap(event) {
    const term = event.currentTarget.dataset.term;
    this.setData({ query: term, suggestions: [] });
    this.search(term);
  },

  onTrendingTap(event) {
    const term = event.currentTarget.dataset.term;
    this.setData({ query: term, suggestions: [] });
    this.search(term);
  },

  onSearch() {
    const query = this.data.query.trim();
    if (query.length === 0 || this.data.loading) return;
    this.search(query);
  },

  onHistoryClear() {
    appApi.apps
      .clearHistory()
      .then(() => {
        this.setData({ history: [] });
      })
      .catch(() => undefined);
  },

  async search(query) {
    if (this.suggestionTimer) {
      clearTimeout(this.suggestionTimer);
    }
    this.setData({ loading: true, error: '', suggestions: [] });
    if (query.length > 0) {
      appApi.apps.recordHistory(query).catch(() => undefined);
      appApi.apps.history().then((history) => this.setData({ history })).catch(() => undefined);
    }
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
