// One-shot generator for the native mini-program pages (run via node).
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..', '..', '..', 'src');
const cwd = process.cwd();
const base = path.join(cwd, 'src');

function page(dir, title, js, wxml, wxss) {
  const pageDir = dir.replace(/\/index$/u, '');
  const abs = path.join(base, pageDir);
  mkdirSync(abs, { recursive: true });
  writeFileSync(path.join(abs, 'index.json'), JSON.stringify({ navigationBarTitleText: title }, null, 2) + '\n');
  writeFileSync(path.join(abs, 'index.js'), js);
  writeFileSync(path.join(abs, 'index.wxml'), wxml);
  writeFileSync(path.join(abs, 'index.wxss'), wxss);
  console.log('page', dir);
}

// ===== 应用 tab =====
page(
  'pages/apps/index',
  '应用中心',
  [
    "const { appApi } = require('../../runtime/app.js');",
    '',
    'Page({',
    "  data: { recommended: [], categories: [], query: '', loading: true },",
    '  async onLoad() {',
    '    const [recommended, categories] = await Promise.all([appApi.apps.recommended(), appApi.apps.categories()]);',
    '    this.setData({ recommended, categories, loading: false });',
    '  },',
    '  onQueryInput(event) { this.setData({ query: event.detail.value }); },',
    '  async onSearch() {',
    '    const query = this.data.query.trim();',
    '    if (query.length === 0) return;',
    '    this.setData({ loading: true });',
    '    const results = await appApi.apps.search(query);',
    '    this.setData({',
    '      recommended: results.map((r) => ({ id: r.app.id, name: r.app.name, summary: r.app.summary, priceLabel: r.app.priceLabel, icon: r.app.icon })),',
    '      loading: false,',
    '    });',
    '  },',
    '});',
    '',
  ].join('\n'),
  [
    '<view class="page-title">应用中心</view>',
    '<view class="search-bar">',
    '  <input class="search-input" placeholder="搜索应用，或者直接告诉我你要做什么" value="{{query}}" bindinput="onQueryInput" confirm-type="search" bindconfirm="onSearch" />',
    '  <button class="search-btn" size="mini" bindtap="onSearch">搜索</button>',
    '</view>',
    '<view class="cats">',
    '  <view wx:for="{{categories}}" wx:key="id" class="cat">{{item.icon}} {{item.id}}</view>',
    '</view>',
    '<view class="page-sub" wx:if="{{!loading}}">共 {{recommended.length}} 个应用</view>',
    '<view class="panel">',
    '  <block wx:if="{{!loading}}">',
    '    <view wx:for="{{recommended}}" wx:key="id" class="row">',
    '      <view class="row-glyph">{{item.icon}}</view>',
    '      <view class="app-main">',
    '        <view class="row-title">{{item.name}}</view>',
    '        <view class="row-desc">{{item.summary}}</view>',
    '      </view>',
    '      <navigator class="app-use" url="/detail/apps-detail/index?appId={{item.id}}">详情</navigator>',
    '    </view>',
    '  </block>',
    '</view>',
    '<view wx:if="{{loading}}" class="empty">加载中…</view>',
    '',
  ].join('\n'),
  [
    '.search-bar { display: flex; gap: 16rpx; padding: 8rpx 32rpx 16rpx; }',
    '.search-input { flex: 1; background: var(--sdk-color-surface-panel); border: 1rpx solid var(--sdk-color-border-subtle); border-radius: 999rpx; padding: 14rpx 28rpx; font-size: 26rpx; }',
    '.search-btn { background: var(--sdk-color-brand); color: #fff; border-radius: 999rpx; font-size: 24rpx; padding: 0 28rpx; }',
    '.cats { display: flex; flex-wrap: wrap; gap: 12rpx; padding: 0 32rpx 16rpx; }',
    '.cat { font-size: 22rpx; border: 1rpx solid var(--sdk-color-border-subtle); border-radius: 999rpx; padding: 8rpx 20rpx; color: var(--sdk-color-text-secondary); background: var(--sdk-color-surface-panel); }',
    '.app-main { flex: 1; min-width: 0; }',
    '.app-use { font-size: 24rpx; color: #fff; background: var(--sdk-color-brand); border-radius: 999rpx; padding: 8rpx 24rpx; }',
    '',
  ].join('\n'),
);

// ===== 通讯录 tab =====
page(
  'pages/contacts/index',
  '通讯录',
  [
    "const { appApi } = require('../../runtime/app.js');",
    '',
    'Page({',
    '  data: { contacts: [], loading: true },',
    '  async onLoad() {',
    "    const contacts = await appApi.contacts.search('');",
    '    this.setData({ contacts, loading: false });',
    '  },',
    '});',
    '',
  ].join('\n'),
  [
    '<view class="page-title">通讯录</view>',
    '<view class="page-sub">人、群、企业、供应商、Agent 与 AI 助手</view>',
    '<view class="panel">',
    '  <view wx:for="{{contacts}}" wx:key="id" class="row">',
    '    <view class="row-glyph">{{item.avatar}}</view>',
    '    <view class="contact-main">',
    '      <view class="row-title">{{item.name}}</view>',
    '      <view class="row-desc">{{item.bio}}</view>',
    '    </view>',
    '  </view>',
    '</view>',
    '<view wx:if="{{loading}}" class="empty">加载中…</view>',
    '',
  ].join('\n'),
  ['.contact-main { flex: 1; min-width: 0; }', ''].join('\n'),
);

// ===== 消息 tab =====
page(
  'pages/messages/index',
  '消息',
  [
    "const { appApi } = require('../../runtime/app.js');",
    '',
    'Page({',
    '  data: { conversations: [], loading: true },',
    '  async onShow() {',
    '    const conversations = await appApi.messages.conversations();',
    '    this.setData({ conversations, loading: false });',
    '  },',
    '  onConversationTap(event) {',
    "    const id = event.currentTarget.dataset.id;",
    "    wx.navigateTo({ url: '/detail/conversation/index?conversationId=' + id });",
    '  },',
    '});',
    '',
  ].join('\n'),
  [
    '<view class="page-title">消息</view>',
    '<view class="page-sub">私聊、通知与 AI 任务事件都在这里</view>',
    '<view class="panel">',
    '  <view wx:for="{{conversations}}" wx:key="id" class="row" data-id="{{item.id}}" bindtap="onConversationTap">',
    '    <view class="contact-main">',
    '      <view class="row-title">{{item.title}}</view>',
    '      <view class="row-desc">{{item.lastMessagePreview}}</view>',
    '    </view>',
    '    <view wx:if="{{item.unread > 0}}" class="unread">{{item.unread}}</view>',
    '  </view>',
    '</view>',
    '<view wx:if="{{loading}}" class="empty">加载中…</view>',
    '',
  ].join('\n'),
  [
    '.contact-main { flex: 1; min-width: 0; }',
    '.unread { min-width: 32rpx; text-align: center; background: #dc2626; color: #fff; font-size: 20rpx; border-radius: 999rpx; padding: 4rpx 10rpx; }',
    '',
  ].join('\n'),
);

// ===== 我的 tab =====
page(
  'pages/profile/index',
  '我的',
  [
    "const { appApi } = require('../../runtime/app.js');",
    '',
    'Page({',
    '  data: { summary: null, loading: true },',
    '  async onLoad() {',
    '    const summary = await appApi.profile.summary();',
    '    this.setData({ summary, loading: false });',
    '  },',
    '});',
    '',
  ].join('\n'),
  [
    '<view class="page-title">我的</view>',
    '<view class="page-sub">你负责问，AI 负责寻</view>',
    '<view class="panel profile-card">',
    '  <view class="avatar">🙂</view>',
    '  <view>',
    '    <view class="row-title">访客</view>',
    '    <view class="row-desc">登录后同步你的数字资产</view>',
    '  </view>',
    '</view>',
    '<view class="panel" wx:if="{{summary}}">',
    '  <view class="row"><view class="stat">{{summary.chats}}</view><view class="stat-label">对话</view></view>',
    '  <view class="row"><view class="stat">{{summary.apps}}</view><view class="stat-label">应用</view></view>',
    '  <view class="row"><view class="stat">{{summary.contacts}}</view><view class="stat-label">联系人</view></view>',
    '</view>',
    '<view wx:if="{{loading}}" class="empty">加载中…</view>',
    '',
  ].join('\n'),
  [
    '.profile-card { display: flex; align-items: center; gap: 20rpx; padding: 32rpx; }',
    '.avatar { font-size: 64rpx; }',
    '.stat { font-size: 40rpx; font-weight: 600; }',
    '.stat-label { font-size: 22rpx; color: var(--sdk-color-text-muted); margin-left: 12rpx; }',
    '',
  ].join('\n'),
);

// ===== detail subpackage: apps-detail =====
page(
  'detail/apps-detail/index',
  '应用详情',
  [
    "const { appApi } = require('../../runtime/app.js');",
    '',
    'Page({',
    '  data: { app: null },',
    '  async onLoad(options) {',
    '    const app = await appApi.apps.detail(options.appId);',
    '    this.setData({ app });',
    '  },',
    '  onUse(event) {',
    '    const appId = event.currentTarget.dataset.appid;',
    '    getApp().globalData.appApi.apps.open(appId);',
    "    wx.showToast({ title: '已在运行预览', icon: 'none' });",
    '  },',
    '  onFavorite() {',
    "    wx.showToast({ title: '已收藏', icon: 'success' });",
    '  },',
    '});',
    '',
  ].join('\n'),
  [
    '<view wx:if="{{app}}" class="detail">',
    '  <view class="detail-head">',
    '    <view class="detail-icon">{{app.icon}}</view>',
    '    <view>',
    '      <view class="row-title">{{app.name}}</view>',
    '      <view class="row-desc">{{app.developer}} · {{app.priceLabel}}</view>',
    '    </view>',
    '  </view>',
    '  <view class="panel detail-card">',
    '    <view class="row-desc">{{app.summary}}</view>',
    '  </view>',
    '  <button class="btn-brand detail-btn" data-appid="{{app.id}}" bindtap="onUse">立即使用</button>',
    '  <button class="detail-fav" data-appid="{{app.id}}" bindtap="onFavorite">收藏</button>',
    '</view>',
    '<view wx:else class="empty">加载中…</view>',
    '',
  ].join('\n'),
  [
    '.detail-head { display: flex; align-items: center; gap: 24rpx; padding: 40rpx 32rpx 16rpx; }',
    '.detail-icon { font-size: 80rpx; }',
    '.detail-card { padding: 24rpx; }',
    '.detail-btn { margin: 24rpx 32rpx; }',
    '.detail-fav { text-align: center; color: var(--sdk-color-text-secondary); font-size: 26rpx; padding: 12rpx; }',
    '',
  ].join('\n'),
);

// ===== detail subpackage: conversation =====
page(
  'detail/conversation/index',
  '会话',
  [
    "const { appApi } = require('../../runtime/app.js');",
    '',
    'Page({',
    "  data: { messages: [], conversationId: '', input: '' },",
    '  async onLoad(options) {',
    '    this.setData({ conversationId: options.conversationId });',
    '    await appApi.messages.markRead(options.conversationId);',
    '    const messages = await appApi.messages.thread(options.conversationId);',
    '    this.setData({ messages });',
    '  },',
    '  onInput(event) { this.setData({ input: event.detail.value }); },',
    '  async onSend() {',
    "    const content = this.data.input.trim();",
    '    if (content.length === 0) return;',
    '    const message = await appApi.messages.send(this.data.conversationId, content);',
    "    this.setData({ messages: [...this.data.messages, message], input: '' });",
    '  },',
    '});',
    '',
  ].join('\n'),
  [
    '<scroll-view scroll-y class="thread">',
    '  <view wx:for="{{messages}}" wx:key="id" class="bubble {{item.senderId === \'me\' ? \'bubble-user\' : \'bubble-ai\'}}">{{item.content}}</view>',
    '</scroll-view>',
    '<view class="composer">',
    '  <input class="composer-input" value="{{input}}" placeholder="输入消息……" bindinput="onInput" confirm-type="send" bindconfirm="onSend" />',
    '  <button class="composer-send" size="mini" bindtap="onSend">发送</button>',
    '</view>',
    '',
  ].join('\n'),
  [
    '.thread { height: calc(100vh - 120rpx); }',
    '.bubble { max-width: 80%; margin: 16rpx 24rpx; padding: 20rpx 28rpx; border-radius: 24rpx; font-size: 28rpx; }',
    '.bubble-user { margin-left: auto; background: var(--sdk-color-brand); color: #fff; }',
    '.bubble-ai { margin-right: auto; background: var(--sdk-color-surface-panel); border: 1rpx solid var(--sdk-color-border-subtle); }',
    '.composer { position: fixed; left: 0; right: 0; bottom: 0; display: flex; gap: 16rpx; padding: 16rpx 24rpx calc(16rpx + env(safe-area-inset-bottom)); background: var(--sdk-color-surface-panel); border-top: 1rpx solid var(--sdk-color-border-subtle); }',
    '.composer-input { flex: 1; background: var(--sdk-color-surface-canvas); border-radius: 999rpx; padding: 16rpx 28rpx; font-size: 28rpx; }',
    '.composer-send { background: var(--sdk-color-brand); color: #fff; border-radius: 999rpx; font-size: 26rpx; padding: 0 32rpx; }',
    '',
  ].join('\n'),
);

console.log('all pages written');
