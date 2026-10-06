// 合集详情 — route id `app.whatseek.apps.collection`. Collection info + its
// curated app list (PRD §4.2.1 编辑精选).
const { appApi } = require('../../runtime/app.js');

Page({
  data: {
    collection: null,
    apps: [],
    loading: true,
    error: '',
    t: {},
    c: {},
  },

  onLoad(options) {
    this.collectionId = typeof options.collectionId === 'string' ? options.collectionId : '';
    this.load();
  },

  onShow() {
    this.applyStrings();
  },

  applyStrings() {
    this.setData({ t: appApi.apps.strings(), c: appApi.commons.strings() });
  },

  async load(options = {}) {
    const silent = options.silent === true;
    this.setData(silent ? { error: '' } : { loading: true, error: '' });
    try {
      const [collection, apps] = await Promise.all([
        appApi.apps.collection(this.collectionId),
        appApi.apps.collectionApps(this.collectionId),
      ]);
      if (collection === null) {
        this.setData({ loading: false, error: appApi.apps.strings().collection.notFound });
        return;
      }
      this.setData({ collection, apps, loading: false });
    } catch (error) {
      this.setData({ loading: false, error: appApi.commons.strings().state.loadFailedDesc });
    }
  },

  onRetry() {
    this.load();
  },
});
