// Route alignment guard: the Flutter route table must match the cross-surface
// contract (H5/PC/mini-program) exactly — route ids are the alignment key —
// and every one of the 13 identities must resolve to a builder/screen.
import 'package:flutter_test/flutter_test.dart';

import 'package:sdkwork_whatseek_flutter_mobile/bootstrap/routes.dart';
import 'package:sdkwork_whatseek_flutter_mobile_core/sdkwork_whatseek_flutter_mobile_core.dart';

void main() {
  test('route_table_matches_the_cross_surface_contract_exactly', () {
    final ids = listWhatseekRouteIdentities()..sort();
    final expected = [...kCrossSurfaceRouteIds]..sort();
    expect(ids, equals(expected));
  });

  test('every_route_id_follows_the_surface_domain_capability_screen_pattern', () {
    final pattern = RegExp(r'^app\.whatseek\.[a-z0-9-]+\.[a-z0-9-]+$');
    for (final route in kWhatseekRouteTable) {
      expect(pattern.hasMatch(route.id), isTrue, reason: 'bad route id: ${route.id}');
      expect(route.titleKey, endsWith('.title'), reason: 'bad titleKey: ${route.titleKey}');
    }
  });

  test('exactly_five_tab_roots_exist_in_prd_order', () {
    expect(kTabRootRoutes.map((route) => route.tab?.name).toList(),
        equals(['chat', 'apps', 'contacts', 'messages', 'profile']));
  });

  test('every_route_identity_has_a_builder_screen', () {
    final tabRoutes = whatseekTabRoutes();
    final detailRoutes = whatseekDetailRoutes();
    final wired = {...tabRoutes.keys, ...detailRoutes.keys};

    for (final route in kTabRootRoutes) {
      expect(tabRoutes.containsKey(route.id), isTrue,
          reason: 'tab root without builder: ${route.id}');
    }
    for (final route in kSecondaryRoutes) {
      expect(detailRoutes.containsKey(route.id), isTrue,
          reason: 'secondary route without builder: ${route.id}');
    }
    expect(wired, equals(kCrossSurfaceRouteIds.toSet()),
        reason: 'route builders must cover the 13 contract ids with no extras');
  });
}
