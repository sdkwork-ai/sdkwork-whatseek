/// Bottom-tab icon pairs (outline glyph → filled glyph) for the five
/// cross-surface tabs.
///
/// APP_FLUTTER_UI_SPEC §5: the selected tab MUST show a filled glyph while the
/// unselected tabs show the outline of the same concept, and selection MUST NOT
/// be conveyed by color alone. Every entry therefore pairs a Material *filled*
/// codepoint with its outline counterpart.
///
/// A glyph family that only ships an outline drawing is not allowed: `grid_view`
/// and `apps` both render their filled and outlined codepoints as the same hollow
/// squares, so the 应用 tab uses the `widgets` family (filled 2×2 blocks vs the
/// outlined grid), which has both states. `test/tab_icons_test.dart` pins this
/// contract.
library;

import 'package:flutter/material.dart';

import 'route_table.dart';

/// `TabId` → (unselected outline icon, selected filled icon).
const Map<TabId, (IconData, IconData)> kTabIcons =
    <TabId, (IconData, IconData)>{
  TabId.chat: (Icons.stars_outlined, Icons.stars),
  TabId.apps: (Icons.widgets_outlined, Icons.widgets),
  TabId.contacts: (Icons.people_outline, Icons.people),
  TabId.messages: (Icons.chat_bubble_outline, Icons.chat_bubble),
  TabId.profile: (Icons.person_outline, Icons.person),
};
