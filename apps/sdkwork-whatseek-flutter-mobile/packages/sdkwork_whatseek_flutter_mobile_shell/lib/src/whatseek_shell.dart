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

  /// One entry per tab root: (label, icon).
  final List<(String, IconData)> destinations;
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
          for (final (label, icon) in destinations)
            NavigationDestination(icon: Icon(icon), label: label),
        ],
      ),
    );
  }
}
