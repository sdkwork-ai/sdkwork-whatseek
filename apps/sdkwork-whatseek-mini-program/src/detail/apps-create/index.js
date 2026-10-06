// 应用创建 — route id `app.whatseek.apps.create`. Three-step flow bound to
// the shared creation port: 需求 → 方案（draftCreationPlan）→ 创建 → 发布.
const { appApi } = require('../../runtime/app.js');

Page({
  data: {
    requirement: '',
    plan: null,
    app: null,
    instruction: '',
    step: 'input',
    working: false,
    error: '',
    t: {},
  },

  onLoad(options) {
    if (typeof options.requirement === 'string' && options.requirement.length > 0) {
      this.setData({ requirement: options.requirement });
    }
  },

  onShow() {
    this.applyStrings();
  },

  applyStrings() {
    this.setData({ t: appApi.apps.strings() });
  },

  onRequirementInput(event) {
    this.setData({ requirement: event.detail.value, error: '' });
  },

  onInstructionInput(event) {
    this.setData({ instruction: event.detail.value });
  },

  async onModify() {
    const instruction = this.data.instruction.trim();
    if (instruction.length === 0 || this.data.working) return;
    this.setData({ working: true, error: '' });
    try {
      const app = await appApi.apps.modify(this.data.app.id, instruction);
      this.setData({ app, instruction: '', working: false });
      appApi.shell.toast(appApi.apps.strings().create.modifiedToast);
    } catch (error) {
      this.setData({ working: false, error: appApi.apps.strings().create.modifyFailed });
    }
  },

  async onDraftPlan() {
    const requirement = this.data.requirement.trim();
    if (this.data.working) return;
    if (requirement.length === 0) {
      this.setData({ error: appApi.apps.strings().create.requirementRequired });
      return;
    }
    this.setData({ working: true, error: '' });
    try {
      const plan = await Promise.resolve(appApi.apps.draftPlan(requirement));
      this.setData({ plan, step: 'plan', working: false });
    } catch (error) {
      this.setData({ working: false, error: appApi.apps.strings().create.planFailed });
    }
  },

  async onCreate() {
    if (this.data.working) return;
    this.setData({ working: true, error: '' });
    try {
      const app = await appApi.apps.createFromPlan(this.data.requirement.trim(), this.data.plan.modules);
      this.setData({ app, step: 'created', working: false });
    } catch (error) {
      this.setData({ working: false, error: appApi.apps.strings().create.createFailed });
    }
  },

  async onPublish() {
    if (this.data.working) return;
    this.setData({ working: true, error: '' });
    try {
      const app = await appApi.apps.publish(this.data.app.id);
      this.setData({ app, working: false });
      appApi.shell.toast(appApi.apps.strings().my.publishedToast);
    } catch (error) {
      this.setData({ working: false, error: appApi.apps.strings().create.publishFailed });
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
