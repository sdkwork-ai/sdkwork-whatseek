import 'package:flutter/material.dart';

import 'package:sdkwork_whatseek_flutter_mobile_apps/sdkwork_whatseek_flutter_mobile_apps.dart';
import 'package:sdkwork_whatseek_flutter_mobile_chat/sdkwork_whatseek_flutter_mobile_chat.dart';
import 'package:sdkwork_whatseek_flutter_mobile_contacts/sdkwork_whatseek_flutter_mobile_contacts.dart';
import 'package:sdkwork_whatseek_flutter_mobile_core/sdkwork_whatseek_flutter_mobile_core.dart';
import 'package:sdkwork_whatseek_flutter_mobile_messages/sdkwork_whatseek_flutter_mobile_messages.dart';
import 'package:sdkwork_whatseek_flutter_mobile_profile/sdkwork_whatseek_flutter_mobile_profile.dart';
import 'package:sdkwork_whatseek_flutter_mobile_shell/sdkwork_whatseek_flutter_mobile_shell.dart';

/// Root application widget (PRD §54): five bottom tabs, chat first.
class WhatseekApp extends StatefulWidget {
  const WhatseekApp({super.key});

  @override
  State<WhatseekApp> createState() => _WhatseekAppState();
}

class _WhatseekAppState extends State<WhatseekApp> {
  int _currentIndex = 0;

  static const List<(String, IconData)> _destinations = [
    ('对话', Icons.auto_awesome),
    ('应用', Icons.grid_view),
    ('通讯录', Icons.people),
    ('消息', Icons.chat_bubble),
    ('我的', Icons.person),
  ];

  static const Map<String, WidgetBuilder> _tabBuilders = {
    'app.whatseek.chat.home': _buildChat,
    'app.whatseek.apps.home': _buildApps,
    'app.whatseek.contacts.home': _buildContacts,
    'app.whatseek.messages.home': _buildMessages,
    'app.whatseek.profile.home': _buildProfile,
  };

  static Widget _buildChat(BuildContext context) => const ChatScreen();
  static Widget _buildApps(BuildContext context) => const AppsHomeScreen();
  static Widget _buildContacts(BuildContext context) => const ContactsHomeScreen();
  static Widget _buildMessages(BuildContext context) => const MessagesHomeScreen();
  static Widget _buildProfile(BuildContext context) => const ProfileHomeScreen();

  Route<dynamic>? _onGenerateRoute(RouteSettings settings) {
    // Named routes use the cross-surface route ids; the tab roots are handled
    // by the shell, detail screens by the builders below.
    switch (settings.name) {
      case 'app.whatseek.apps.detail':
        final appId = settings.arguments as String;
        return MaterialPageRoute<void>(
          settings: settings,
          builder: (context) => AppDetailScreen(appId: appId),
        );
      case 'app.whatseek.apps.runner':
        final appId = settings.arguments as String;
        return MaterialPageRoute<void>(
          settings: settings,
          builder: (context) => _RunnerScreen(appId: appId),
        );
      case 'app.whatseek.apps.my':
        return MaterialPageRoute<void>(
          settings: settings,
          builder: (context) => const MyAppsScreen(),
        );
      case 'app.whatseek.apps.create':
        final requirement = settings.arguments as String? ?? '';
        return MaterialPageRoute<void>(
          settings: settings,
          builder: (context) => AppCreateScreen(initialRequirement: requirement),
        );
      case 'app.whatseek.contacts.detail':
        final contactId = settings.arguments as String;
        return MaterialPageRoute<void>(
          settings: settings,
          builder: (context) => ContactDetailScreen(contactId: contactId),
        );
      case 'app.whatseek.messages.conversation':
        final conversationId = settings.arguments as String;
        return MaterialPageRoute<void>(
          settings: settings,
          builder: (context) => ConversationScreen(conversationId: conversationId),
        );
      default:
        return null;
    }
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'WhatSeek 问寻',
      theme: ThemeData(colorSchemeSeed: const Color(0xFF2563EB), useMaterial3: true),
      onGenerateRoute: _onGenerateRoute,
      home: WhatseekShell(
        destinations: _destinations,
        currentIndex: _currentIndex,
        onDestinationSelected: (index) => setState(() {
          _currentIndex = index;
        }),
        child: IndexedStack(
          index: _currentIndex,
          children: [
            for (final route in kTabRootRoutes)
              _tabBuilders[route.id]!(context),
          ],
        ),
      ),
    );
  }
}

/// In-app app runner preview (PRD 应用调用). Phase 1 renders a mock preview.
class _RunnerScreen extends StatelessWidget {
  const _RunnerScreen({required this.appId});

  final String appId;

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
