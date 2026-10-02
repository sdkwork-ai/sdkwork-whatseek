const { appApi } = require('../../runtime/app.js');

Page({
  data: { app: null },
  async onLoad(options) {
    const app = await appApi.apps.detail(options.appId);
    this.setData({ app });
  },
  onUse(event) {
    const appId = event.currentTarget.dataset.appid;
    getApp().globalData.appApi.apps.open(appId);
    wx.showToast({ title: '已在运行预览', icon: 'none' });
  },
  onFavorite() {
    wx.showToast({ title: '已收藏', icon: 'success' });
  },
});
