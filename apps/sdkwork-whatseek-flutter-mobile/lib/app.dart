import 'package:flutter/material.dart';

import 'package:sdkwork_whatseek_flutter_mobile_apps/sdkwork_whatseek_flutter_mobile_apps.dart';
import 'package:sdkwork_whatseek_flutter_mobile_chat/sdkwork_whatseek_flutter_mobile_chat.dart';
import 'package:sdkwork_whatseek_flutter_mobile_contacts/sdkwork_whatseek_flutter_mobile_contacts.dart';
import 'package:sdkwork_whatseek_flutter_mobile_core/sdkwork_whatseek_flutter_mobile_core.dart';
import 'package:sdkwork_whatseek_flutter_mobile_messages/sdkwork_whatseek_flutter_mobile_messages.dart';
import 'package:sdkwork_whatseek_flutter_mobile_profile/sdkwork_whatseek_flutter_mobile_profile.dart';
import 'package:sdkwork_whatseek_flutter_mobile_shell/sdkwork_whatseek_flutter_mobile_shell.dart';

import 'auth_gate.dart';
import 'bootstrap/routes.dart';

/// Root application widget (PRD §54): five bottom tabs, chat first. Detail
/// routes are composed in `bootstrap/routes.dart` — single owner for route
/// composition.
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
    final builders = whatseekDetailRoutes();
    final builder = builders[settings.name];
    if (builder == null) {
      return null;
    }
    return MaterialPageRoute<void>(settings: settings, builder: builder);
  }

  @override
  Widget build(BuildContext context) {
    return AuthGate(
      child: MaterialApp(
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
              for (final route in kTabRootRoutes) _tabBuilders[route.id]!(context),
            ],
          ),
        ),
      ),
    );
  }
}
