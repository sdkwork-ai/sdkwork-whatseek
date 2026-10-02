const { appApi } = require('../../runtime/app.js');

Page({
  data: { recommended: [], categories: [], query: '', loading: true },
  async onLoad() {
    const [recommended, categories] = await Promise.all([appApi.apps.recommended(), appApi.apps.categories()]);
    this.setData({ recommended, categories, loading: false });
  },
  onQueryInput(event) { this.setData({ query: event.detail.value }); },
  async onSearch() {
    const query = this.data.query.trim();
    if (query.length === 0) return;
    this.setData({ loading: true });
    const results = await appApi.apps.search(query);
    this.setData({
      recommended: results.map((r) => ({ id: r.app.id, name: r.app.name, summary: r.app.summary, priceLabel: r.app.priceLabel, icon: r.app.icon })),
      loading: false,
    });
  },
});
