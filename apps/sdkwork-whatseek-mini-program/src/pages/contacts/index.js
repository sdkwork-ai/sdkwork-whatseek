// 通讯录 tab — route id `app.whatseek.contacts.home`. Search + list with
// loading/empty/error states; rows open the contact detail page.
const { appApi } = require('../../runtime/app.js');

Page({
  data: {
    contacts: [],
    segments: [],
    segment: 'all',
    query: '',
    loading: true,
    error: '',
    t: {},
    c: {},
  },

  onLoad() {
    this.load();
  },

  onShow() {
    this.applyStrings();
  },

  applyStrings() {
    const t = appApi.contacts.strings();
    // REQ-0004 kind segments — the six-segment filter (H5/PC/Flutter parity);
    // keys mirror whatseek.contacts.segment.*.
    const segments = [
      { id: 'all', label: t.segment.all },
      { id: 'person', label: t.segment.person },
      { id: 'group', label: t.segment.group },
      { id: 'org', label: t.segment.org },
      { id: 'agent', label: t.segment.agent },
      { id: 'assistant', label: t.segment.assistant },
    ];
    this.setData({ t, c: appApi.commons.strings(), segments });
  },

  onSegmentTap(event) {
    const segment = event.currentTarget.dataset.id;
    if (segment === this.data.segment) return;
    this.setData({ segment });
    this.applyFilter();
  },

  applyFilter() {
    const all = this.data.allContacts;
    const segment = this.data.segment;
    const query = this.data.query.trim().toLowerCase();
    const contacts = (all || []).filter((contact) => {
      const kindMatch = segment === 'all' || contact.kind === segment;
      const queryMatch =
        query.length === 0 ||
        contact.name.toLowerCase().includes(query) ||
        contact.bio.toLowerCase().includes(query);
      return kindMatch && queryMatch;
    });
    this.setData({ contacts });
  },

  async load(options = {}) {
    const silent = options.silent === true;
    this.setData(silent ? { error: '' } : { loading: true, error: '' });
    try {
      const allContacts = await appApi.contacts.search('');
      this.setData({ allContacts, loading: false });
      this.applyFilter();
    } catch (error) {
      this.setData({ loading: false, error: appApi.commons.strings().state.loadFailedDesc });
    }
  },

  async onPullDownRefresh() {
    await this.load({ silent: true });
    wx.stopPullDownRefresh();
  },

  onQueryInput(event) {
    this.setData({ query: event.detail.value });
    this.applyFilter();
  },

  onSearch() {
    this.applyFilter();
  },

  onRetry() {
    this.load();
  },

  onContactTap(event) {
    const contactId = event.currentTarget.dataset.id;
    appApi.shell.navigate(`/detail/contact-detail/index?contactId=${contactId}`);
  },
});
