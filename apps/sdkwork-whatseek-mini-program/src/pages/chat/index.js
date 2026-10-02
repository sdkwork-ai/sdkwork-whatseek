// 对话 tab — AI chat entry (PRD §8/§9). Logic comes from the bundled runtime;
// this page layer only binds data and events (MINI_PROGRAM_APP_ARCHITECTURE_SPEC
// §Packages vs platform pages). Assistant turns carry card views and an
// optional task chip whose state refreshes through the shared TasksPort.
const { appApi } = require('../../runtime/app.js');

Page({
  data: {
    entries: [],
    input: '',
    sending: false,
    suggestionKeys: ['帮我找一个视频剪辑工具', '帮我做一个库存管理系统', '给张三发消息，告诉他下午三点开会', '找一个支持定制的手机壳供应商'],
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
        entries: [...entries, { role: 'assistant', text: '出了点问题，请重试。' }],
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
        entries: [...this.data.entries, { role: 'assistant', text: '操作失败，请重试。' }],
      });
    }
  },

  async onTaskTap(event) {
    const entryindex = Number(event.currentTarget.dataset.entryindex);
    const entry = this.data.entries[entryindex];
    if (!entry || !entry.taskId) return;
    try {
      const task = await appApi.chat.taskStatus(entry.taskId);
      if (task === null) {
        appApi.shell.toast('任务不存在');
        return;
      }
      const label = appApi.shell.taskStateLabel(task.state);
      this.setData({
        [`entries[${entryindex}].taskState`]: task.resultSummary ? `${label} · ${task.resultSummary}` : label,
      });
    } catch (error) {
      appApi.shell.toast('任务状态获取失败');
    }
  },

  onContactTap(event) {
    const contactId = event.currentTarget.dataset.id;
    appApi.shell.navigate(`/detail/contact-detail/index?contactId=${contactId}`);
  },
});
