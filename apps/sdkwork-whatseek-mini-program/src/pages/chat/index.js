// 对话 tab — AI chat entry (PRD §8/§9). Logic comes from the bundled runtime;
// this page layer only binds data and events (MINI_PROGRAM_APP_ARCHITECTURE_SPEC
// §Packages vs platform pages). Assistant turns carry card views and an
// optional task chip whose state refreshes through the shared TasksPort.
// Static chrome strings bind through `appApi.chat.strings()` and re-apply in
// onShow so a settings locale switch takes effect on the next visit.
const { appApi } = require('../../runtime/app.js');

Page({
  data: {
    entries: [],
    input: '',
    sending: false,
    t: {},
    suggestionKeys: [],
  },

  onShow() {
    this.applyStrings();
    // PRD §5.5 deep link: a task notification in Messages parks the task id
    // in globalData (switchTab cannot carry params) — restore it as a chat
    // entry with its state chip.
    const pendingTaskId = getApp().globalData.pendingTaskId;
    if (typeof pendingTaskId !== 'string' || pendingTaskId.length === 0) {
      return;
    }
    getApp().globalData.pendingTaskId = '';
    if (this.data.entries.some((entry) => entry.taskId === pendingTaskId)) {
      return;
    }
    void (async () => {
      try {
        const task = await appApi.chat.taskStatus(pendingTaskId);
        if (task === null || this.data.entries.some((entry) => entry.taskId === pendingTaskId)) {
          return;
        }
        const label = appApi.shell.taskStateLabel(task.state);
        this.setData({
          entries: [
            ...this.data.entries,
            {
              role: 'assistant',
              text: task.resultSummary ?? task.title,
              taskId: task.id,
              taskState: task.resultSummary ? `${label} · ${task.resultSummary}` : label,
            },
          ],
        });
      } catch (error) {
        appApi.shell.toast(appApi.chat.strings().page.taskLoadFailedToast);
      }
    })();
  },

  applyStrings() {
    const t = appApi.chat.strings();
    this.setData({
      t,
      suggestionKeys: [t.suggest.searchApp, t.suggest.createApp, t.suggest.sendMessage, t.suggest.searchSupplier],
    });
  },

  onInput(event) {
    this.setData({ input: event.detail.value });
  },

  async onSuggestion(event) {
    await this.send(event.currentTarget.dataset.text);
  },

  async onSend() {
    const text = this.data.input.trim();
    if (text.length === 0 || this.data.sending) {
      return;
    }
    await this.send(text);
  },

  async send(text) {
    const entries = [...this.data.entries, { role: 'user', text }];
    this.setData({ entries, input: '', sending: true });
    try {
      const turn = await appApi.chat.send(text);
      this.setData({
        entries: [
          ...entries,
          { role: 'assistant', text: turn.replyText, cards: turn.cards, taskId: turn.taskId, taskState: '' },
        ],
        sending: false,
      });
    } catch (error) {
      this.setData({
        entries: [...entries, { role: 'assistant', text: appApi.chat.strings().reply.error }],
        sending: false,
      });
    }
  },

  async onAction(event) {
    const { kind, entryindex, contactid, contactname, draft } = event.currentTarget.dataset;
    let action;
    if (kind === 'generate') {
      const entry = this.data.entries[Number(entryindex)];
      const plan = entry && entry.cards ? entry.cards.plan : null;
      action = { kind: 'generate_app', requirement: plan ? plan.requirement : '', modules: plan ? plan.modules : [] };
    } else {
      action = { kind: 'confirm_send_message', contactId: contactid, contactName: contactname, draft };
    }
    try {
      const message = await appApi.chat.runAction(action);
      this.setData({
        entries: [...this.data.entries, { role: 'assistant', text: message }],
      });
    } catch (error) {
      this.setData({
        entries: [...this.data.entries, { role: 'assistant', text: appApi.chat.strings().page.actionFailed }],
      });
    }
  },

  async onTaskAction(event) {
    const { kind, entryindex } = event.currentTarget.dataset;
    const entry = this.data.entries[Number(entryindex)];
    if (!entry || !entry.taskId) return;
    const action = kind === 'confirm' ? { kind: 'confirm_task', taskId: entry.taskId } : { kind: 'cancel_task', taskId: entry.taskId };
    try {
      const message = await appApi.chat.runAction(action);
      this.setData({
        entries: [...this.data.entries, { role: 'assistant', text: message }],
      });
      await this.refreshTaskState(Number(entryindex));
    } catch (error) {
      appApi.shell.toast(appApi.chat.strings().page.actionFailedToast);
    }
  },

  async refreshTaskState(entryindex) {
    const entry = this.data.entries[entryindex];
    if (!entry || !entry.taskId) return;
    try {
      const task = await appApi.chat.taskStatus(entry.taskId);
      if (task === null) {
        return;
      }
      const label = appApi.shell.taskStateLabel(task.state);
      this.setData({
        [`entries[${entryindex}].taskState`]: task.resultSummary ? `${label} · ${task.resultSummary}` : label,
        [`entries[${entryindex}].taskWaiting`]: task.state === 'waiting_confirmation',
      });
    } catch (error) {
      appApi.shell.toast(appApi.chat.strings().page.taskStateFailedToast);
    }
  },

  async onTaskTap(event) {
    await this.refreshTaskState(Number(event.currentTarget.dataset.entryindex));
  },

  onContactTap(event) {
    const contactId = event.currentTarget.dataset.id;
    appApi.shell.navigate(`/detail/contact-detail/index?contactId=${contactId}`);
  },
});
