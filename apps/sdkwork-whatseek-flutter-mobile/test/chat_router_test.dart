// Chat router + apps service tests: the PRD §10.2 examples and the
// create-as-default flow, exercised through the mock clients. Replies carry
// i18n keys (`whatseek.chat.reply.*`) resolved with zh copy in assertions.
import 'package:flutter_test/flutter_test.dart';

import 'package:sdkwork_whatseek_flutter_mobile_apps/sdkwork_whatseek_flutter_mobile_apps.dart';
import 'package:sdkwork_whatseek_flutter_mobile_chat/sdkwork_whatseek_flutter_mobile_chat.dart';
import 'package:sdkwork_whatseek_flutter_mobile_core/sdkwork_whatseek_flutter_mobile_core.dart';

void main() {
  test('recognizes_SEARCH_APP_for_the_prd_search_example', () {
    expect(recognizeIntent('帮我找一个视频剪辑工具').intent, equals('SEARCH_APP'));
  });

  test('recognizes_CREATE_APP_for_the_prd_create_example', () {
    expect(recognizeIntent('帮我做一个视频剪辑工具').intent, equals('CREATE_APP'));
  });

  test('recognizes_SEARCH_SUPPLIER_for_the_prd_supplier_example', () {
    expect(recognizeIntent('找一个支持定制的手机壳供应商').intent, equals('SEARCH_SUPPLIER'));
  });

  test('recognizes_SEND_MESSAGE_and_captures_the_name', () {
    final result = recognizeIntent('给张三发消息，告诉他下午三点开会');
    expect(result.intent, equals('SEND_MESSAGE'));
    expect(result.keywords, contains('张三'));
  });

  test('falls_back_to_GENERAL_CHAT_for_small_talk', () {
    expect(recognizeIntent('今天天气怎么样？').intent, equals('GENERAL_CHAT'));
  });

  test('chat_router_returns_app_results_for_a_search_intent', () async {
    final runtime = WhatseekRuntime();
    final reply = await runtime.chat.handleSend('帮我找一个视频剪辑工具');
    expect(reply.text, equals('whatseek.chat.reply.searchAppFound'));
    expect(WhatseekChatStrings.resolve('zh-CN', reply.text), contains('找到'));
    expect(WhatseekChatStrings.resolve('en-US', reply.text), contains('apps that fit'));
    expect(reply.cards.first.type, equals('app_results'));
    expect(reply.cards.first.apps.first.app.name, equals('剪辑大师'));
  });

  test('chat_router_offers_a_creation_plan_when_nothing_matches', () async {
    final runtime = WhatseekRuntime();
    final reply = await runtime.chat.handleSend('帮我找一个量子折叠机管理工具');
    expect(reply.text, equals('whatseek.chat.reply.searchAppNotFoundCreate'));
    expect(reply.cards.first.type, equals('app_plan'));
    expect(reply.cards.first.planModules, isNotEmpty);
  });

  test('generate_action_creates_a_published_track_and_notifies_messages',
      () async {
    final runtime = WhatseekRuntime();
    final outcome = await runtime.chat.runCardAction({
      'kind': 'generate_app',
      'requirement': '帮我做一个库存管理系统',
      'modules': ['库存盘点', '库存预警'],
    });
    expect(outcome.messageKey, equals('whatseek.chat.reply.actionAppGenerated'));
    expect(outcome.params['name'], contains('库存管理'));
    expect(
        WhatseekChatStrings.resolve('zh-CN', outcome.messageKey, outcome.params),
        contains('已生成应用'));
    final myApps = await runtime.apps.listMyApps();
    expect(myApps.first.name, contains('库存管理'));
    final conversations = await runtime.messages.listConversations();
    expect(conversations.first.kind, equals(ConversationKind.task));
    expect(conversations.first.titleKey, equals('whatseek.messages.kind.task'));
  });

  test('confirm_send_message_requires_the_explicit_action_and_sends', () async {
    final runtime = WhatseekRuntime();
    final reply = await runtime.chat.handleSend('给张三发消息，告诉他下午三点开会');
    expect(reply.cards.first.type, equals('send_message_confirm'));
    final before = await runtime.messages.listMessages('conv-zhangsan');
    expect(before.length, equals(1));
    final outcome = await runtime.chat.runCardAction({
      'kind': 'confirm_send_message',
      'contactId': 'zhangsan',
      'contactName': '张三',
      'draft': '下午三点开会',
    });
    expect(outcome.messageKey, equals('whatseek.chat.reply.actionMessageSent'));
    final after = await runtime.messages.listMessages('conv-zhangsan');
    expect(after.length, equals(2));
  });

  test('openApp_serves_catalog_apps_and_records_recent', () async {
    final apps = MockAppsClient();
    final app = await apps.openApp('clip-master');
    expect(app, isNotNull);
    expect(app!.id, equals('clip-master'));
    final recent = await apps.listRecent();
    expect(recent.map((entry) => entry.id), contains('clip-master'));
  });

  test('openApp_denies_visitor_sessions_for_enterprise_apps', () async {
    final apps = MockAppsClient();
    await expectLater(
      apps.openApp('crm-manager', isVisitor: true),
      throwsA(isA<WhatseekPermissionDeniedException>()),
    );
  });

  test('openApp_allows_named_sessions_for_enterprise_apps', () async {
    final apps = MockAppsClient();
    final app = await apps.openApp('crm-manager', isVisitor: false);
    expect(app, isNotNull);
  });

  test('openApp_returns_null_for_unknown_apps', () async {
    final apps = MockAppsClient();
    expect(await apps.openApp('no-such-app'), isNull);
  });

  test('apps_client_search_finds_the_crm_app_for_natural_language', () async {
    final apps = MockAppsClient();
    final results = await apps.searchApps('适合20人销售团队的客户管理工具');
    expect(results.map((entry) => entry.app.id), contains('crm-manager'));
  });

  test('creation_flow_previews_modifies_and_publishes', () async {
    final apps = MockAppsClient();
    final plan = apps.draftCreationPlan('帮我创建一个客户管理系统');
    expect(plan.modules, contains('客户列表'));
    final created = await apps.createAppFromPlan('帮我创建一个客户管理系统', plan.modules);
    expect(created.lifecycle, equals(CreatedAppLifecycle.preview));
    final modified = await apps.modifyApp(created.id, '增加订单管理');
    expect(modified.versions.length, equals(2));
    final published = await apps.publishApp(created.id);
    expect(published.lifecycle, equals(CreatedAppLifecycle.published));
  });

  test('categories_carry_i18n_label_keys', () async {
    final apps = MockAppsClient();
    final categories = await apps.listCategories();
    expect(categories.first.labelKey, equals('whatseek.apps.category.efficiency'));
    expect(
      WhatseekAppsStrings.resolve('en-US', categories.first.labelKey.replaceFirst('whatseek.apps.', '')),
      equals('Efficiency'),
    );
  });
}
