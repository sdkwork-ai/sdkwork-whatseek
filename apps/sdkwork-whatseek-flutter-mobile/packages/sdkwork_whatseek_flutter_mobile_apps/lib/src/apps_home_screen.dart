import 'package:flutter/material.dart';

import "package:sdkwork_whatseek_flutter_mobile_core/sdkwork_whatseek_flutter_mobile_core.dart";
import "package:sdkwork_whatseek_flutter_mobile_commons/sdkwork_whatseek_flutter_mobile_commons.dart";

import 'i18n/apps_strings.dart';

/// 应用 tab root (PRD §13): the search entry opens the dedicated search route
/// (`app.whatseek.apps.search`), recommended apps fill the home list.
class AppsHomeScreen extends StatefulWidget {
  const AppsHomeScreen({super.key, this.onOpenApp});

  final ValueChanged<String>? onOpenApp;

  @override
  State<AppsHomeScreen> createState() => _AppsHomeScreenState();
}

class _AppsHomeScreenState extends State<AppsHomeScreen> {
  late Future<List<WhatseekApp>> _recommended;

  @override
  void initState() {
    super.initState();
    _recommended = WhatseekRuntime.instance.apps.listRecommended();
  }

  void _openSearch(String query) {
    Navigator.of(context).pushNamed(
      'app.whatseek.apps.search',
      arguments: query.trim(),
    );
  }

  void _openDetail(String appId) {
    if (widget.onOpenApp != null) {
      widget.onOpenApp!(appId);
      return;
    }
    Navigator.of(context).pushNamed('app.whatseek.apps.detail', arguments: appId);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(WhatseekAppsStrings.of(context, 'home.title'))),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              decoration: InputDecoration(
                hintText: WhatseekAppsStrings.of(context, 'home.searchPlaceholder'),
                prefixIcon: const Icon(Icons.search),
                border: const OutlineInputBorder(borderRadius: BorderRadius.all(Radius.circular(24))),
                isDense: true,
              ),
              onSubmitted: _openSearch,
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 8),
            child: Align(
              alignment: Alignment.centerLeft,
              child: Text(
                WhatseekAppsStrings.of(context, 'home.recommended'),
                style: Theme.of(context).textTheme.titleSmall,
              ),
            ),
          ),
          Expanded(
            child: FutureBuilder<List<WhatseekApp>>(
              future: _recommended,
              builder: (context, snapshot) {
                if (snapshot.connectionState != ConnectionState.done) {
                  return const ScreenState(state: ScreenStateKind.loading);
                }
                if (snapshot.hasError) {
                  return ScreenState(
                    state: ScreenStateKind.error,
                    onRetry: () => setState(() {
                      _recommended = WhatseekRuntime.instance.apps.listRecommended();
                    }),
                  );
                }
                final results = snapshot.data ?? const <WhatseekApp>[];
                if (results.isEmpty) {
                  return ScreenState(
                    state: ScreenStateKind.empty,
                    title: WhatseekAppsStrings.of(context, 'search.emptyTitle'),
                  );
                }
                return ListView.builder(
                  itemCount: results.length,
                  itemBuilder: (context, index) {
                    final app = results[index];
                    return ListTile(
                      leading: Text(app.icon, style: const TextStyle(fontSize: 28)),
                      title: Text(app.name),
                      subtitle: Text(app.summary, maxLines: 2, overflow: TextOverflow.ellipsis),
                      trailing: Text(app.priceLabel),
                      onTap: () => _openDetail(app.id),
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
