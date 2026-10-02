// 设置 — route id `app.whatseek.profile.settings`. Language switches the chat
// reply locale through the runtime facade; appearance follows the WeChat
// system theme (native `darkmode: true` + theme.json), reported live here.
const { appApi } = require('../../runtime/app.js');

Page({
  data: {
    locale: 'zh-CN',
    systemTheme: 'light',
    version: '0.1.0',
  },

  onLoad() {
    this.setData({ locale: appApi.profile.getAppearance().locale });
    this.applySystemTheme();
    this.onThemeChanged = (result) => {
      this.applySystemTheme(result.theme);
    };
    if (typeof wx.onThemeChange === 'function') {
      wx.onThemeChange(this.onThemeChanged);
    }
  },

  onUnload() {
    if (typeof wx.offThemeChange === 'function' && this.onThemeChanged) {
      wx.offThemeChange(this.onThemeChanged);
    }
  },

  applySystemTheme(theme) {
    let resolved = theme;
    if (resolved !== 'dark' && resolved !== 'light') {
      try {
        const baseInfo = typeof wx.getAppBaseInfo === 'function' ? wx.getAppBaseInfo() : {};
        resolved = baseInfo.theme === 'dark' ? 'dark' : 'light';
      } catch (error) {
        resolved = 'light';
      }
    }
    this.setData({ systemTheme: resolved });
  },

  onLocale(event) {
    const locale = event.currentTarget.dataset.locale;
    if (locale !== 'zh-CN' && locale !== 'en-US') return;
    appApi.profile.setLocale(locale);
    this.setData({ locale });
    appApi.shell.toast(locale === 'zh-CN' ? '已切换为中文' : 'Switched to English');
  },
});
