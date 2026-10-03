import 'package:flutter/material.dart';

/// Phone-first bottom navigation shell. Tab destinations are the five
/// cross-surface tab roots; detail screens push on top via named routes.
class WhatseekShell extends StatelessWidget {
  const WhatseekShell({
    super.key,
    required this.destinations,
    required this.currentIndex,
    required this.onDestinationSelected,
    required this.child,
  });

  /// One entry per tab root: (label, outline icon, filled icon). The filled
  /// glyph marks the selected destination and the outline glyph the rest
  /// (tab icon-state norm in APP_FLUTTER_UI_SPEC §5).
  final List<(String, IconData, IconData)> destinations;
  final int currentIndex;
  final ValueChanged<int> onDestinationSelected;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: child,
      bottomNavigationBar: NavigationBar(
        selectedIndex: currentIndex,
        onDestinationSelected: onDestinationSelected,
        destinations: [
          for (final (label, icon, selectedIcon) in destinations)
            NavigationDestination(
              icon: Icon(icon),
              selectedIcon: Icon(selectedIcon),
              label: label,
            ),
        ],
      ),
    );
  }
}
