import 'package:flutter/material.dart';

import "package:sdkwork_whatseek_flutter_mobile_core/sdkwork_whatseek_flutter_mobile_core.dart";
import "package:sdkwork_whatseek_flutter_mobile_commons/sdkwork_whatseek_flutter_mobile_commons.dart";

import 'i18n/apps_strings.dart';

/// Search results for keyword and natural-language queries (PRD §32/§33):
/// submit-driven search, scored result rows, empty/error states, and the
/// create-as-fallback footer (H5 `AppSearchScreen` parity).
class AppsSearchScreen extends StatefulWidget {
  const AppsSearchScreen({super.key, this.initialQuery = ''});

  final String initialQuery;

  @override
  State<AppsSearchScreen> createState() => _AppsSearchScreenState();
}

class _AppsSearchScreenState extends State<AppsSearchScreen> {
  late String _query;
  late Future<List<AppRecommendation>> _results;

  @override
  void initState() {
    super.initState();
    _query = widget.initialQuery.trim();
    _results = _search(_query);
  }

  Future<List<AppRecommendation>> _search(String query) async {
    final trimmed = query.trim();
    if (trimmed.isEmpty) {
      return const [];
    }
    return WhatseekRuntime.instance.apps.searchApps(trimmed);
  }

  void _submit(String draft) {
    final query = draft.trim();
    setState(() {
      _query = query;
      _results = _search(query);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(WhatseekAppsStrings.of(context, 'search.title'))),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              autofocus: widget.initialQuery.isEmpty,
              decoration: InputDecoration(
                hintText: WhatseekAppsStrings.of(context, 'home.searchPlaceholder'),
                labelText: WhatseekAppsStrings.of(context, 'search.inputLabel'),
                prefixIcon: const Icon(Icons.search),
                border: const OutlineInputBorder(
                    borderRadius: BorderRadius.all(Radius.circular(24))),
                isDense: true,
              ),
              onSubmitted: _submit,
            ),
          ),
          Expanded(
            child: FutureBuilder<List<AppRecommendation>>(
              future: _results,
              builder: (context, snapshot) {
                if (snapshot.connectionState != ConnectionState.done) {
                  return const ScreenState(state: ScreenStateKind.loading);
                }
                if (snapshot.hasError) {
                  return ScreenState(
                    state: ScreenStateKind.error,
                    onRetry: () => _submit(_query),
                  );
                }
                final results = snapshot.data ?? const <AppRecommendation>[];
                if (results.isEmpty) {
                  // Empty state + create-as-fallback footer (H5 parity): a
                  // missed search funnels into AI creation with the query.
                  return Column(
                    children: [
                      Expanded(
                        child: ScreenState(
                          state: ScreenStateKind.empty,
                          title: WhatseekAppsStrings.of(context, 'search.emptyTitle'),
                          message: WhatseekAppsStrings.of(context, 'search.emptyDescription'),
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(WhatseekAppsStrings.of(context, 'search.createFallback'),
                                style: Theme.of(context).textTheme.bodySmall),
                            TextButton(
                              onPressed: () => Navigator.of(context).pushNamed(
                                'app.whatseek.apps.create',
                                arguments: _query,
                              ),
                              child: Text(WhatseekAppsStrings.of(context, 'search.createFallbackAction')),
                            ),
                          ],
                        ),
                      ),
                    ],
                  );
                }
                return _buildResults(context, results);
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildResults(BuildContext context, List<AppRecommendation> results) {
    return ListView(
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 4, 16, 8),
          child: Text(
            WhatseekAppsStrings.of(context, 'search.resultCount', {'count': results.length}),
            style: Theme.of(context).textTheme.bodySmall,
          ),
        ),
        for (final recommendation in results)
          ListTile(
            leading: Text(recommendation.app.icon, style: const TextStyle(fontSize: 28)),
            title: Text(recommendation.app.name),
            subtitle: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(recommendation.app.summary,
                    maxLines: 2, overflow: TextOverflow.ellipsis),
                // REQ-0002 row coverage: category · users · AI marker.
                Text(
                  [
                    recommendation.app.category,
                    recommendation.app.usersLabel,
                    if (recommendation.app.aiCapability)
                      WhatseekAppsStrings.of(context, 'search.aiCapability'),
                  ].where((part) => part.isNotEmpty).join(' · '),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: Theme.of(context).textTheme.labelSmall,
                ),
                const SizedBox(height: 2),
                Text(
                  WhatseekAppsStrings.of(
                      context, 'search.matchedOn', {'keyword': recommendation.reason}),
                  style: Theme.of(context).textTheme.labelSmall?.copyWith(
                        color: Theme.of(context).colorScheme.primary,
                      ),
                ),
              ],
            ),
            trailing: Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text('★ ${recommendation.app.rating.toStringAsFixed(1)}'),
                Text(recommendation.app.priceLabel,
                    style: Theme.of(context).textTheme.labelSmall),
              ],
            ),
            onTap: () => Navigator.of(context).pushNamed(
              'app.whatseek.apps.detail',
              arguments: recommendation.app.id,
            ),
          ),
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(WhatseekAppsStrings.of(context, 'search.createFallback'),
                  style: Theme.of(context).textTheme.bodySmall),
              TextButton(
                onPressed: () => Navigator.of(context).pushNamed(
                  'app.whatseek.apps.create',
                  arguments: _query,
                ),
                child: Text(WhatseekAppsStrings.of(context, 'search.createFallbackAction')),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
