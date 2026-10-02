// 应用创建 — route id `app.whatseek.apps.create`. Three-step flow bound to
// the shared creation port: 需求 → 方案（draftCreationPlan）→ 创建 → 发布.
const { appApi } = require('../../runtime/app.js');

Page({
  data: {
    requirement: '',
    plan: null,
    app: null,
    step: 'input',
    working: false,
    error: '',
  },

  onLoad(options) {
    if (typeof options.requirement === 'string' && options.requirement.length > 0) {
      this.setData({ requirement: options.requirement });
    }
  },

  onRequirementInput(event) {
    this.setData({ requirement: event.detail.value });
  },

  async onDraftPlan() {
    const requirement = this.data.requirement.trim();
    if (requirement.length === 0 || this.data.working) return;
    this.setData({ working: true, error: '' });
    try {
      const plan = await Promise.resolve(appApi.apps.draftPlan(requirement));
      this.setData({ plan, step: 'plan', working: false });
    } catch (error) {
      this.setData({ working: false, error: '方案生成失败，请重试。' });
    }
  },

  async onCreate() {
    if (this.data.working) return;
    this.setData({ working: true, error: '' });
    try {
      const app = await appApi.apps.createFromPlan(this.data.requirement.trim(), this.data.plan.modules);
      this.setData({ app, step: 'created', working: false });
    } catch (error) {
      this.setData({ working: false, error: '应用创建失败，请重试。' });
    }
  },

  async onPublish() {
    if (this.data.working) return;
    this.setData({ working: true, error: '' });
    try {
      const app = await appApi.apps.publish(this.data.app.id);
      this.setData({ app, working: false });
      appApi.shell.toast('已发布到应用市场');
    } catch (error) {
      this.setData({ working: false, error: '发布失败，请重试。' });
    }
  },

  onRun() {
    appApi.shell.navigate(`/detail/apps-runner/index?appId=${this.data.app.id}`);
  },

  onRestart() {
    this.setData({ requirement: '', plan: null, app: null, step: 'input', working: false, error: '' });
  },

  onRetry() {
    if (this.data.step === 'plan') {
      this.onCreate();
    } else if (this.data.step === 'created') {
      this.onPublish();
    } else {
      this.setData({ error: '' });
    }
  },
});
