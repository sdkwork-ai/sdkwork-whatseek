// 排行榜 — route id `app.whatseek.apps.charts`. 热门 / 免费 / 新品 top-10,
// mirroring the home feed 榜单速览 quick view (PRD §4.2.1).
const { appApi } = require('../../runtime/app.js');

const CHARTS = [
  { id: 'hot', title: '热门榜' },
  { id: 'free', title: '免费榜' },
  { id: 'new', title: '新品榜' },
];

Page({
  data: {
    charts: [],
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
      const charts = await Promise.all(
        CHARTS.map(async (chart) => ({
          ...chart,
          apps: await appApi.apps.chart(chart.id),
        })),
      );
      this.setData({ charts, loading: false });
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
});
