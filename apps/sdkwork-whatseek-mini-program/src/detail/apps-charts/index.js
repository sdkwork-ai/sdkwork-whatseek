// 排行榜 — route id `app.whatseek.apps.charts`. 热门 / 免费 / 新品 top-10,
// mirroring the home feed 榜单速览 quick view (PRD §4.2.1). Chart titles
// resolve through the localized `whatseek.apps.chart.*` fragments.
const { appApi } = require('../../runtime/app.js');

const CHART_IDS = ['hot', 'free', 'new'];

Page({
  data: {
    charts: [],
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
    this.setData({ t: appApi.apps.strings(), c: appApi.commons.strings() });
  },

  async load(options = {}) {
    const silent = options.silent === true;
    this.setData(silent ? { error: '' } : { loading: true, error: '' });
    try {
      const chartStrings = appApi.apps.strings().chart;
      const charts = await Promise.all(
        CHART_IDS.map(async (id) => ({
          id,
          title: chartStrings[id] ?? id,
          apps: await appApi.apps.chart(id),
        })),
      );
      this.setData({ charts, loading: false });
    } catch (error) {
      this.setData({ loading: false, error: appApi.commons.strings().state.loadFailedDesc });
    }
  },

  async onPullDownRefresh() {
    await this.load({ silent: true });
    wx.stopPullDownRefresh();
  },

  onRetry() {
    this.load();
  },
});
