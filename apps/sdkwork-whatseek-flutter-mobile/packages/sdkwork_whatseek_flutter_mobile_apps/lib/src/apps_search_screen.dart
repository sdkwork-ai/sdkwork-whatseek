import 'dart:async';

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
  final TextEditingController _draft = TextEditingController();
  Timer? _suggestionDebounce;
  List<String> _suggestions = const [];
  List<String> _history = const [];
  late Future<List<String>> _trending;

  @override
  void initState() {
    super.initState();
    _query = widget.initialQuery.trim();
    _draft.text = _query;
    _results = _search(_query);
    // Trending terms feed the empty-query state; hidden when the store
    // driver has no server-side source (empty list) — sdkwork-appstore
    // reference search parity.
    _trending = _query.isEmpty
        ? WhatseekRuntime.instance.apps.listTrendingSearches()
        : Future.value(const []);
    if (_query.isEmpty) {
      _loadHistory();
    }
  }

  @override
  void dispose() {
    _suggestionDebounce?.cancel();
    _draft.dispose();
    super.dispose();
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
    _suggestionDebounce?.cancel();
    if (query.isNotEmpty) {
      WhatseekRuntime.instance.apps
          .recordSearchHistory(query)
          .then((_) => _loadHistory())
          .catchError((_) {});
    }
    setState(() {
      _query = query;
      _suggestions = const [];
      _results = _search(query);
    });
  }

  /// Refresh the history chips (best-effort; errors leave the list as-is).
  void _loadHistory() {
    WhatseekRuntime.instance.apps.listSearchHistory().then((history) {
      if (mounted) {
        setState(() => _history = history);
      }
    }).catchError((_) {});
  }

  Future<void> _clearHistory() async {
    await WhatseekRuntime.instance.apps.clearSearchHistory();
    if (mounted) {
      setState(() => _history = const []);
    }
  }

  /// Debounced server suggestions for the typed prefix (≥2 chars).
  void _onChanged(String draft) {
    _suggestionDebounce?.cancel();
    final trimmed = draft.trim();
    if (trimmed.length < 2 || trimmed == _query) {
      if (_suggestions.isNotEmpty) {
        setState(() => _suggestions = const []);
      }
      return;
    }
    _suggestionDebounce = Timer(const Duration(milliseconds: 250), () async {
      final terms = await WhatseekRuntime.instance.apps
          .listSearchSuggestions(trimmed)
          .catchError((_) => <String>[]);
      if (mounted) {
        setState(() => _suggestions = terms);
      }
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
              controller: _draft,
              onChanged: _onChanged,
              onSubmitted: _submit,
            ),
          ),
          if (_suggestions.isNotEmpty)
            ConstrainedBox(
              constraints: const BoxConstraints(maxHeight: 180),
              child: ListView(
                shrinkWrap: true,
                children: [
                  for (final term in _suggestions)
                    ListTile(
                      dense: true,
                      leading: const Icon(Icons.search, size: 16),
                      title: Text(term),
                      onTap: () {
                        _draft.text = term;
                        _submit(term);
                      },
                    ),
                ],
              ),
            ),
          if (_query.isEmpty && _history.isNotEmpty)
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 8),
              child: Align(
                alignment: Alignment.centerLeft,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(WhatseekAppsStrings.of(context, 'search.history'),
                        style: Theme.of(context).textTheme.labelSmall),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 8,
                      children: [
                        for (final term in _history)
                          ActionChip(
                            label: Text(term),
                            onPressed: () {
                              _draft.text = term;
                              _submit(term);
                            },
                          ),
                      ],
                    ),
                    Align(
                      alignment: Alignment.centerRight,
                      child: TextButton(
                        onPressed: _clearHistory,
                        child: Text(WhatseekAppsStrings.of(context, 'search.historyClear')),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          if (_query.isEmpty)
            FutureBuilder<List<String>>(
              future: _trending,
              builder: (context, snapshot) {
                final terms = snapshot.data ?? const <String>[];
                if (terms.isEmpty) {
                  return const SizedBox.shrink();
                }
                return Padding(
                  padding: const EdgeInsets.fromLTRB(16, 0, 16, 8),
                  child: Align(
                    alignment: Alignment.centerLeft,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(WhatseekAppsStrings.of(context, 'search.trending'),
                            style: Theme.of(context).textTheme.labelSmall),
                        const SizedBox(height: 8),
                        Wrap(
                          spacing: 8,
                          children: [
                            for (final term in terms)
                              ActionChip(
                                label: Text(term),
                                onPressed: () {
                                  _draft.text = term;
                                  _submit(term);
                                },
                              ),
                          ],
                        ),
                      ],
                    ),
                  ),
                );
              },
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
