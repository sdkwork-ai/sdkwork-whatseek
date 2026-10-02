/// Route table wiring for the Flutter surface: the canonical identities come
/// from the core package; this module maps ids to the screen builders used by
/// the root widget (single owner for route composition). Tab roots render
/// inside the shell; every secondary route pushes as a named route.
library;

import 'package:flutter/material.dart';

import 'package:sdkwork_whatseek_flutter_mobile_apps/sdkwork_whatseek_flutter_mobile_apps.dart';
import 'package:sdkwork_whatseek_flutter_mobile_chat/sdkwork_whatseek_flutter_mobile_chat.dart';
import 'package:sdkwork_whatseek_flutter_mobile_contacts/sdkwork_whatseek_flutter_mobile_contacts.dart';
import 'package:sdkwork_whatseek_flutter_mobile_messages/sdkwork_whatseek_flutter_mobile_messages.dart';
import 'package:sdkwork_whatseek_flutter_mobile_profile/sdkwork_whatseek_flutter_mobile_profile.dart';

import 'iam_runtime.dart';
import 'settings.dart';

/// Tab-root builders keyed by cross-surface route id, in PRD order.
Map<String, WidgetBuilder> whatseekTabRoutes() {
  return {
    'app.whatseek.chat.home': (context) => const ChatScreen(),
    'app.whatseek.apps.home': (context) => const AppsHomeScreen(),
    'app.whatseek.contacts.home': (context) => const ContactsHomeScreen(),
    'app.whatseek.messages.home': (context) => const MessagesHomeScreen(),
    'app.whatseek.profile.home': (context) => const ProfileHomeScreen(),
  };
}

/// Detail-route builders keyed by cross-surface route id. The map covers
/// every secondary route declared in the core route table.
Map<String, WidgetBuilder> whatseekDetailRoutes() {
  return {
    'app.whatseek.apps.search': (context) {
      final query = ModalRoute.of(context)?.settings.arguments as String? ?? '';
      return AppsSearchScreen(initialQuery: query);
    },
    'app.whatseek.apps.detail': (context) {
      final appId = ModalRoute.of(context)?.settings.arguments as String? ?? '';
      return AppDetailScreen(appId: appId);
    },
    'app.whatseek.apps.runner': (context) {
      final appId = ModalRoute.of(context)?.settings.arguments as String? ?? '';
      return AppRunnerScreen(
        appId: appId,
        isVisitor: WhatseekIamRuntime.instance.user?.isVisitor ?? true,
      );
    },
    'app.whatseek.apps.my': (context) => const MyAppsScreen(),
    'app.whatseek.apps.create': (context) {
      final requirement = ModalRoute.of(context)?.settings.arguments as String? ?? '';
      return AppCreateScreen(initialRequirement: requirement);
    },
    'app.whatseek.contacts.detail': (context) {
      final contactId = ModalRoute.of(context)?.settings.arguments as String? ?? '';
      return ContactDetailScreen(contactId: contactId);
    },
    'app.whatseek.messages.conversation': (context) {
      final conversationId = ModalRoute.of(context)?.settings.arguments as String? ?? '';
      return ConversationScreen(conversationId: conversationId);
    },
    'app.whatseek.profile.settings': (context) =>
        SettingsScreen(settings: WhatseekAppSettings.instance.controller),
  };
}
