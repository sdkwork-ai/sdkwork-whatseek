import 'package:flutter/material.dart';

import "package:sdkwork_whatseek_flutter_mobile_core/sdkwork_whatseek_flutter_mobile_core.dart";

/// Localized UI strings for the chat capability.
///
/// Source of truth: `lib/src/i18n/<locale>/whatseek/chat/strings.json`
/// (APP_FLUTTER_UI_SPEC §i18n layout). The maps below mirror those fragments;
/// `test/i18n_layout_test.dart` parses the fragments and fails on drift.
const Map<String, Map<String, String>> chatStrings = {
  'zh-CN': {
    'home.title': '对话',
    'home.heroTitle': '你想做什么？',
    'home.heroSubtitle': '告诉我就可以。',
    'home.inputPlaceholder': '输入消息……',
    'home.inputLabel': '消息输入框',
    'home.send': '发送',
    'home.thinking': '问寻正在思考…',
    'home.newTopic': '开始新对话',
    'suggest.searchApp': '帮我找一个视频剪辑工具',
    'suggest.createApp': '帮我做一个库存管理系统',
    'suggest.sendMessage': '给张三发消息，告诉他下午三点开会',
    'suggest.searchSupplier': '找一个支持定制的手机壳供应商',
    'task.pending': '排队中',
    'task.running': '执行中',
    'task.waiting_confirmation': '待确认',
    'task.completed': '已完成',
    'task.failed': '失败',
    'task.cancelled': '已取消',
    'task.expired': '已过期',
    'card.recommendReason': '匹配 {{keyword}}',
    'card.useNow': '使用',
    'card.generateNow': '直接生成',
    'card.sendTo': '发送给 {{name}}：',
    'card.confirmSend': '确认发送',
    'card.confirmNote': '涉及对外发送，需要你明确确认后才会执行。',
    'card.commerce.product': '商品结果（商业生态预览）',
    'card.commerce.supplier': '供应商结果（商业生态预览）',
    'card.commerce.service': '服务结果（商业生态预览）',
    'reply.searchAppFound': '找到适合你的应用：',
    'reply.searchAppNotFoundCreate': '没有找到现成的应用 —— 我可以直接帮你创建一个：',
    'reply.createAppPlan': '好的，我准备创建，方案如下：',
    'reply.sendMessageConfirm': '我找到了联系人，发送前请确认：',
    'reply.sendMessageContactNotFound': '通讯录里没有找到这个联系人。',
    'reply.searchPersonFound': '找到这些联系人：',
    'reply.searchPersonNotFound': '没有找到相关联系人。',
    'reply.searchSupplier': '为你找到这些供应商（商业生态预览）：',
    'reply.commercePreview': '商业生态预览（Phase 2 接入完整供需网络）：',
    'reply.createContentAccepted': '收到！任务已完成。',
    'reply.general': '我是问寻 AI。你可以让我找应用、创建应用、找供应商，或者联系某人——直接说就行。',
    'reply.error': '出了点问题，请重试。',
    'reply.searchAgent.found': '找到这些 Agent / 智能体：',
    'reply.searchAgent.notFound': '暂时没有匹配的 Agent。你可以描述需求，后续版本可以直接创建。',
    'reply.useAgent.found': '可以派这些 Agent 帮你执行：',
    'reply.createAgent.recommend': '创建数字员工将在后续版本开放，先用现成的 Agent 试试：',
    'reply.task.accepted': '收到！任务已开始，完成后我会通知你。',
    'reply.actionAppGenerated': '已生成应用「{{name}}」，可以在「我的应用」中查看。',
    'reply.actionMessageSent': '消息已发送，可以在「消息」中继续对话。',
    'reply.actionNavigated': '好的。',
  },
  'en-US': {
    'home.title': 'Chat',
    'home.heroTitle': 'What do you want to do?',
    'home.heroSubtitle': 'Just tell me.',
    'home.inputPlaceholder': 'Type a message…',
    'home.inputLabel': 'Message input',
    'home.send': 'Send',
    'home.thinking': 'WhatSeek is thinking…',
    'home.newTopic': 'Start a new chat',
    'suggest.searchApp': 'Find me a video editing tool',
    'suggest.createApp': 'Build me an inventory management system',
    'suggest.sendMessage': 'Message Zhang San about the 3pm meeting',
    'suggest.searchSupplier': 'Find a customizable phone case supplier',
    'task.pending': 'Pending',
    'task.running': 'Running',
    'task.waiting_confirmation': 'Waiting confirmation',
    'task.completed': 'Completed',
    'task.failed': 'Failed',
    'task.cancelled': 'Cancelled',
    'task.expired': 'Expired',
    'card.recommendReason': 'matches {{keyword}}',
    'card.useNow': 'Use',
    'card.generateNow': 'Generate now',
    'card.sendTo': 'Send to {{name}}:',
    'card.confirmSend': 'Confirm send',
    'card.confirmNote':
        'This sends a message to someone else; it runs only after your explicit confirmation.',
    'card.commerce.product': 'Product results (commerce preview)',
    'card.commerce.supplier': 'Supplier results (commerce preview)',
    'card.commerce.service': 'Service results (commerce preview)',
    'reply.searchAppFound': 'I found apps that fit:',
    'reply.searchAppNotFoundCreate': 'No existing app matched — I can create one for you:',
    'reply.createAppPlan': 'Sure, here is the plan:',
    'reply.sendMessageConfirm': 'I found the contact. Please confirm before sending:',
    'reply.sendMessageContactNotFound': 'I could not find that contact.',
    'reply.searchPersonFound': 'Found these contacts:',
    'reply.searchPersonNotFound': 'No matching contacts.',
    'reply.searchSupplier': 'Here are matching suppliers (commerce preview):',
    'reply.commercePreview': 'Commerce preview (full supply-demand network arrives in Phase 2):',
    'reply.createContentAccepted': 'Got it! The task completed.',
    'reply.general':
        'I am WhatSeek AI. Ask me to find apps, create apps, find suppliers, or reach someone.',
    'reply.error': 'Something went wrong. Please retry.',
    'reply.actionAppGenerated': 'Generated app "{{name}}" — see it under My apps.',
    'reply.actionMessageSent': 'Message sent — continue the conversation in Messages.',
    'reply.actionNavigated': 'Done.',
    'reply.searchAgent.found': 'Here are the matching agents:',
    'reply.searchAgent.notFound': 'No matching agent yet. Describe what you need — creation arrives in a later release.',
    'reply.useAgent.found': 'These agents can take this on for you:',
    'reply.createAgent.recommend': 'Agent creation opens in a later release — try an existing one for now:',
    'reply.task.accepted': 'Got it! The task has started; I will notify you when it completes.',
  },
};

class WhatseekChatStrings {
  WhatseekChatStrings._();

  static const _set = WhatseekStringSet(chatStrings);

  /// Resolve a chat string for the ambient locale (zh fallback). Unknown
  /// keys resolve to the key itself, so raw service text passes through.
  static String of(
    BuildContext context,
    String key, [
    Map<String, Object?> params = const {},
  ]) =>
      _set.of(context, key, params);

  /// Resolve a chat string for an explicit locale (tests, shell-less use).
  static String resolve(
    String locale,
    String key, [
    Map<String, Object?> params = const {},
  ]) =>
      _set.resolve(locale, key, params);
}
