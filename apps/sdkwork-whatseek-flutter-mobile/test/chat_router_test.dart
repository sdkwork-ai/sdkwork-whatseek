// Chat router + apps service tests: the PRD §10.2 examples and the
// create-as-default flow, exercised through the mock clients.
import 'package:flutter_test/flutter_test.dart';

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
    expect(reply.text, contains('找到'));
    expect(reply.cards.first.type, equals('app_results'));
    expect(reply.cards.first.apps.first.app.name, equals('剪辑大师'));
  });

  test('chat_router_offers_a_creation_plan_when_nothing_matches', () async {
    final runtime = WhatseekRuntime();
    final reply = await runtime.chat.handleSend('帮我找一个量子折叠机管理工具');
    expect(reply.cards.first.type, equals('app_plan'));
    expect(reply.cards.first.planModules, isNotEmpty);
  });

  test('generate_action_creates_a_published_track_and_notifies_messages', () async {
    final runtime = WhatseekRuntime();
    final message = await runtime.chat.runCardAction({
      'kind': 'generate_app',
      'requirement': '帮我做一个库存管理系统',
      'modules': ['库存盘点', '库存预警'],
    });
    expect(message, contains('已生成应用'));
    final myApps = await runtime.apps.listMyApps();
    expect(myApps.first.name, contains('库存管理'));
    final conversations = await runtime.messages.listConversations();
    expect(conversations.first.kind, equals(ConversationKind.task));
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
    expect(outcome, contains('已发送'));
    final after = await runtime.messages.listMessages('conv-zhangsan');
    expect(after.length, equals(2));
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
}
