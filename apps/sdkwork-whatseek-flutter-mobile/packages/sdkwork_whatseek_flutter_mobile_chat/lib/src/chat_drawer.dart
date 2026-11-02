import 'package:flutter/material.dart';

import 'i18n/chat_strings.dart';

/// Side menu of the 对话 tab root. The chat entry owns its own navigation
/// chrome; the drawer gathers the destinations a chat user reaches for
/// (a fresh conversation plus the app-center shortcuts) without duplicating
/// the five-tab bottom bar.
///
/// The drawer is presentational only: every entry closes the drawer and hands
/// the intent back to the screen as a callback, so navigation stays owned by
/// the chat composition.
class ChatDrawer extends StatelessWidget {
  const ChatDrawer({
    super.key,
    required this.onNewChat,
    required this.onOpenMyApps,
    required this.onOpenFavorites,
    required this.onOpenCreateApp,
    required this.onOpenSettings,
  });

  final VoidCallback onNewChat;
  final VoidCallback onOpenMyApps;
  final VoidCallback onOpenFavorites;
  final VoidCallback onOpenCreateApp;
  final VoidCallback onOpenSettings;

  /// Closes the drawer route before running the entry action, so the pushed
  /// screen never stacks above a still-open drawer.
  void _select(BuildContext context, VoidCallback action) {
    Navigator.of(context).pop();
    action();
  }

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final textTheme = Theme.of(context).textTheme;
    return Drawer(
      child: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 20, 8, 16),
              child: Row(
                children: [
                  CircleAvatar(
                    backgroundColor: scheme.primaryContainer,
                    child: Icon(
                      Icons.auto_awesome,
                      color: scheme.onPrimaryContainer,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          WhatseekChatStrings.of(context, 'home.drawerTitle'),
                          style: textTheme.titleMedium,
                        ),
                        const SizedBox(height: 2),
                        Text(
                          WhatseekChatStrings.of(
                              context, 'home.drawerSubtitle'),
                          style: textTheme.bodySmall,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    onPressed: () => Navigator.of(context).pop(),
                    icon: const Icon(Icons.close),
                    tooltip:
                        WhatseekChatStrings.of(context, 'home.drawerClose'),
                  ),
                ],
              ),
            ),
            const Divider(height: 1),
            _DrawerEntry(
              icon: Icons.add_comment_outlined,
              label: WhatseekChatStrings.of(context, 'home.drawerNewChat'),
              onTap: () => _select(context, onNewChat),
            ),
            _DrawerEntry(
              icon: Icons.grid_view_outlined,
              label: WhatseekChatStrings.of(context, 'home.drawerMyApps'),
              onTap: () => _select(context, onOpenMyApps),
            ),
            _DrawerEntry(
              icon: Icons.star_outline,
              label: WhatseekChatStrings.of(context, 'home.drawerFavorites'),
              onTap: () => _select(context, onOpenFavorites),
            ),
            _DrawerEntry(
              icon: Icons.auto_awesome_outlined,
              label: WhatseekChatStrings.of(context, 'home.drawerCreateApp'),
              onTap: () => _select(context, onOpenCreateApp),
            ),
            const Spacer(),
            const Divider(height: 1),
            _DrawerEntry(
              icon: Icons.settings_outlined,
              label: WhatseekChatStrings.of(context, 'home.drawerSettings'),
              onTap: () => _select(context, onOpenSettings),
            ),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }
}

/// One drawer row: a left-aligned glyph plus its localized label.
class _DrawerEntry extends StatelessWidget {
  const _DrawerEntry({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  final IconData icon;
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(icon),
      title: Text(label),
      onTap: onTap,
    );
  }
}
