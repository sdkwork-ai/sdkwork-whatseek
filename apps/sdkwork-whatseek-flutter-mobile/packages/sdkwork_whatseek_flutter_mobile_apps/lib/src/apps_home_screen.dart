import 'package:flutter/material.dart';

import "package:sdkwork_whatseek_flutter_mobile_core/sdkwork_whatseek_flutter_mobile_core.dart";
import "package:sdkwork_whatseek_flutter_mobile_commons/sdkwork_whatseek_flutter_mobile_commons.dart";

/// 应用 tab root (PRD §13): search prompt, categories, recommended apps.
class AppsHomeScreen extends StatefulWidget {
  const AppsHomeScreen({super.key, this.onOpenApp});

  final ValueChanged<String>? onOpenApp;

  @override
  State<AppsHomeScreen> createState() => _AppsHomeScreenState();
}

class _AppsHomeScreenState extends State<AppsHomeScreen> {
  late Future<List<AppRecommendation>> _results;
  String _query = '';

  @override
  void initState() {
    super.initState();
    _results = WhatseekRuntime.instance.apps.searchApps('');
  }

  void _search(String query) {
    setState(() {
      _query = query;
      _results = WhatseekRuntime.instance.apps.searchApps(query);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('应用中心')),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              decoration: const InputDecoration(
                hintText: '搜索应用，或者直接告诉我你要做什么',
                prefixIcon: Icon(Icons.search),
                border: OutlineInputBorder(borderRadius: BorderRadius.all(Radius.circular(24))),
                isDense: true,
              ),
              onSubmitted: _search,
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
                    onRetry: () => _search(_query),
                  );
                }
                final results = snapshot.data ?? const <AppRecommendation>[];
                if (results.isEmpty) {
                  return const ScreenState(state: ScreenStateKind.empty);
                }
                return ListView.builder(
                  itemCount: results.length,
                  itemBuilder: (context, index) {
                    final recommendation = results[index];
                    final app = recommendation.app;
                    return ListTile(
                      leading: Text(app.icon, style: const TextStyle(fontSize: 28)),
                      title: Text(app.name),
                      subtitle: Text(app.summary, maxLines: 2, overflow: TextOverflow.ellipsis),
                      trailing: Text(app.priceLabel),
                      onTap: () => Navigator.of(context).pushNamed(
                        'app.whatseek.apps.detail',
                        arguments: app.id,
                      ),
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
