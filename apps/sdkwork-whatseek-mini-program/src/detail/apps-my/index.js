// 我的应用 — route id `app.whatseek.apps.my`. Lists created apps with
// lifecycle badges and publish / run / delete actions (delete confirms first).
const { appApi } = require('../../runtime/app.js');

const LIFECYCLE_LABELS = {
  draft: '草稿',
  generating: '生成中',
  preview: '预览',
  published: '已发布',
  updated: '已更新',
  archived: '已归档',
};

Page({
  data: {
    apps: [],
    loading: true,
    error: '',
  },

  onShow() {
    this.load();
  },

  async load() {
    this.setData({ loading: true, error: '' });
    try {
      const apps = await appApi.apps.myApps();
      this.setData({
        apps: apps.map((app) => ({ ...app, lifecycleLabel: LIFECYCLE_LABELS[app.lifecycle] ?? app.lifecycle })),
        loading: false,
      });
    } catch (error) {
      this.setData({ loading: false, error: '加载失败，请稍后重试。' });
    }
  },

  onRetry() {
    this.load();
  },

  onCreate() {
    appApi.shell.navigate('/detail/apps-create/index');
  },

  onRun(event) {
    const appId = event.currentTarget.dataset.id;
    appApi.shell.navigate(`/detail/apps-runner/index?appId=${appId}`);
  },

  async onPublish(event) {
    const appId = event.currentTarget.dataset.id;
    try {
      await appApi.apps.publish(appId);
      appApi.shell.toast('已发布到应用市场');
      this.load();
    } catch (error) {
      appApi.shell.toast('发布失败，请重试');
    }
  },

  onDelete(event) {
    const { id, name } = event.currentTarget.dataset;
    wx.showModal({
      title: '删除应用',
      content: `确定删除「${name}」吗？删除后不可恢复。`,
      confirmText: '删除',
      confirmColor: '#dc2626',
      success: async (res) => {
        if (!res.confirm) return;
        try {
          await appApi.apps.deleteMyApp(id);
          appApi.shell.toast('已删除');
          this.load();
        } catch (error) {
          appApi.shell.toast('删除失败，请重试');
        }
      },
    });
  },
});
