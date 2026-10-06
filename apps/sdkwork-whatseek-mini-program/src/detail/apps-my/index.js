// 我的应用 — route id `app.whatseek.apps.my`. Lists created apps with
// lifecycle badges and publish / run / delete actions (delete confirms first).
// Lifecycle labels resolve through the localized `whatseek.apps.lifecycle.*`
// fragments (key-aligned with the H5 apps fragments).
const { appApi } = require('../../runtime/app.js');

Page({
  data: {
    tab: 'created',
    apps: [],
    favorites: [],
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

  onTabSwitch(event) {
    this.setData({ tab: event.currentTarget.dataset.tab });
  },

  async load(options = {}) {
    const silent = options.silent === true;
    this.setData(silent ? { error: '' } : { loading: true, error: '' });
    try {
      const [apps, favorites] = await Promise.all([appApi.apps.myApps(), appApi.apps.favorites()]);
      this.setData({
        apps: apps.map((app) => this.decorate(app)),
        favorites: favorites.map((app) => this.decorate(app)),
        loading: false,
      });
    } catch (error) {
      this.setData({ loading: false, error: appApi.commons.strings().state.loadFailedDesc });
    }
  },

  decorate(app) {
    const lifecycle = appApi.apps.strings().lifecycle;
    const versions = Array.isArray(app.versions) ? app.versions : [];
    return {
      ...app,
      lifecycleLabel: lifecycle[app.lifecycle] ?? app.lifecycle,
      versionLabel: versions.length > 0 ? `v${versions[versions.length - 1]}` : '',
    };
  },

  async onPullDownRefresh() {
    await this.load({ silent: true });
    wx.stopPullDownRefresh();
  },

  onRetry() {
    this.load();
  },

  onCreate() {
    appApi.shell.navigate('/detail/apps-create/index');
  },

  async onToggleFavorite(event) {
    const appId = event.currentTarget.dataset.id;
    try {
      const favorited = await appApi.apps.toggleFavorite(appId);
      appApi.shell.toast(favorited ? appApi.apps.strings().detail.addedToast : appApi.apps.strings().detail.removedToast);
      await this.load({ silent: true });
    } catch (error) {
      appApi.shell.toast(appApi.commons.strings().action.failed);
    }
  },

  onRun(event) {
    const appId = event.currentTarget.dataset.id;
    appApi.shell.navigate(`/detail/apps-runner/index?appId=${appId}`);
  },

  // PRD §21 AI 修改: continue-modifying from 我的应用 — the editable modal
  // collects the instruction; the port bumps the created app's version.
  onModify(event) {
    const appId = event.currentTarget.dataset.id;
    wx.showModal({
      title: 'AI 修改',
      editable: true,
      placeholderText: '继续修改，例如：增加订单管理',
      success: async (res) => {
        if (!res.confirm) return;
        const instruction = (res.content || '').trim();
        if (instruction.length === 0) {
          appApi.shell.toast('请输入修改内容');
          return;
        }
        try {
          await appApi.apps.modify(appId, instruction);
          appApi.shell.toast('已更新');
          this.load({ silent: true });
        } catch (error) {
          appApi.shell.toast('修改失败，请重试');
        }
      },
    });
  },

  onShare(event) {
    const { id, name } = event.currentTarget.dataset;
    wx.setClipboardData({
      data: `${name} · WhatSeek 问寻`,
      success: () => appApi.shell.toast('已复制到剪贴板'),
    });
    void id;
  },

  async onPublish(event) {
    const appId = event.currentTarget.dataset.id;
    try {
      await appApi.apps.publish(appId);
      appApi.shell.toast(appApi.apps.strings().my.publishedToast);
      this.load();
    } catch (error) {
      appApi.shell.toast(appApi.apps.strings().my.publishFailedToast);
    }
  },

  onDelete(event) {
    const { id, name } = event.currentTarget.dataset;
    const strings = appApi.apps.strings().my;
    wx.showModal({
      title: strings.deleteTitle,
      content: strings.deleteConfirm.replace('{name}', name),
      confirmText: strings.delete,
      confirmColor: '#dc2626',
      success: async (res) => {
        if (!res.confirm) return;
        try {
          await appApi.apps.deleteMyApp(id);
          appApi.shell.toast(strings.deletedToast);
          this.load();
        } catch (error) {
          appApi.shell.toast(strings.deleteFailedToast);
        }
      },
    });
  },
});
