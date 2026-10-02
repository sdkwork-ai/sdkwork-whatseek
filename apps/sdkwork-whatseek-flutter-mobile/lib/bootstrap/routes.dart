/// Route table wiring for the Flutter surface: the canonical identities come
/// from the core package; this module maps ids to the screen builders used by
/// the root widget (single owner for route composition).
library;

import 'package:flutter/material.dart';

import 'package:sdkwork_whatseek_flutter_mobile_apps/sdkwork_whatseek_flutter_mobile_apps.dart';
import 'package:sdkwork_whatseek_flutter_mobile_contacts/sdkwork_whatseek_flutter_mobile_contacts.dart';
import 'package:sdkwork_whatseek_flutter_mobile_messages/sdkwork_whatseek_flutter_mobile_messages.dart';

/// Detail-route builders keyed by cross-surface route id. Tab roots are
/// handled by the shell; this map covers every pushed screen.
Map<String, WidgetBuilder> whatseekDetailRoutes() {
  return {
    'app.whatseek.apps.detail': (context) {
      final appId = ModalRoute.of(context)?.settings.arguments as String? ?? '';
      return AppDetailScreen(appId: appId);
    },
    'app.whatseek.apps.runner': (context) => const _RunnerHost(),
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
  };
}

class _RunnerHost extends StatelessWidget {
  const _RunnerHost();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('运行应用')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('🧩', style: Theme.of(context).textTheme.displayLarge),
            const SizedBox(height: 12),
            const Text('应用运行预览'),
            const SizedBox(height: 4),
            Text('正式版将在云端沙箱中运行真实应用。',
                style: Theme.of(context).textTheme.bodySmall),
          ],
        ),
      ),
    );
  }
}
