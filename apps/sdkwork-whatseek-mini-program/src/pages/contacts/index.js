// 通讯录 tab — route id `app.whatseek.contacts.home`. Search + list with
// loading/empty/error states; rows open the contact detail page.
const { appApi } = require('../../runtime/app.js');

Page({
  data: {
    contacts: [],
    query: '',
    loading: true,
    error: '',
  },

  onLoad() {
    this.load();
  },

  async load() {
    this.setData({ loading: true, error: '' });
    try {
      const contacts = await appApi.contacts.search(this.data.query.trim());
      this.setData({ contacts, loading: false });
    } catch (error) {
      this.setData({ loading: false, error: '加载失败，请稍后重试。' });
    }
  },

  onQueryInput(event) {
    this.setData({ query: event.detail.value });
  },

  onSearch() {
    if (this.data.loading) return;
    this.load();
  },

  onRetry() {
    this.load();
  },

  onContactTap(event) {
    const contactId = event.currentTarget.dataset.id;
    appApi.shell.navigate(`/detail/contact-detail/index?contactId=${contactId}`);
  },
});
