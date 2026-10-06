import 'package:flutter/material.dart';

import "package:sdkwork_whatseek_flutter_mobile_core/sdkwork_whatseek_flutter_mobile_core.dart";
import "package:sdkwork_whatseek_flutter_mobile_commons/sdkwork_whatseek_flutter_mobile_commons.dart";

import 'i18n/apps_strings.dart';

/// Collection detail (appstore route `app.whatseek.apps.collection`): the
/// editorial collection header plus its curated app list (H5
/// `AppCollectionScreen` parity). Unknown ids render the not-found empty
/// state.
class AppCollectionScreen extends StatefulWidget {
  const AppCollectionScreen({super.key, required this.collectionId});

  final String collectionId;

  @override
  State<AppCollectionScreen> createState() => _AppCollectionScreenState();
}

/// One snapshot of the collection header and its resolved app list.
typedef _CollectionData = (AppCollection? collection, List<WhatseekApp> apps);

class _AppCollectionScreenState extends State<AppCollectionScreen> {
  late Future<_CollectionData> _data;

  @override
  void initState() {
    super.initState();
    _reload();
  }

  void _reload() {
    setState(() {
      _data = _load();
    });
  }

  Future<_CollectionData> _load() async {
    final apps = WhatseekRuntime.instance.apps;
    final collection = await apps.getCollection(widget.collectionId);
    final collectionApps = await apps.listCollectionApps(widget.collectionId);
    return (collection, collectionApps);
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<_CollectionData>(
      future: _data,
      builder: (context, snapshot) {
        // The loaded collection titles the nav bar; the generic 合集 title
        // covers loading/error/not-found chrome (H5 parity).
        final collection = snapshot.data?.$1;
        return Scaffold(
          appBar: AppBar(
            title: Text(collection?.title ??
                WhatseekAppsStrings.of(context, 'collection.title')),
          ),
          body: _buildBody(context, snapshot),
        );
      },
    );
  }

  Widget _buildBody(BuildContext context, AsyncSnapshot<_CollectionData> snapshot) {
    if (snapshot.connectionState != ConnectionState.done) {
      return const ScreenState(state: ScreenStateKind.loading);
    }
    if (snapshot.hasError) {
      return ScreenState(
        state: ScreenStateKind.error,
        onRetry: _reload,
      );
    }
    final collection = snapshot.data?.$1;
    if (collection == null) {
      return ScreenState(
        state: ScreenStateKind.empty,
        title: WhatseekAppsStrings.of(context, 'collection.notFound'),
      );
    }
    final apps = snapshot.data?.$2 ?? const <WhatseekApp>[];
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text(collection.title, style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: 4),
        Text(collection.description,
            style: Theme.of(context).textTheme.bodySmall),
        const SizedBox(height: 12),
        Card(
          margin: EdgeInsets.zero,
          clipBehavior: Clip.antiAlias,
          child: Column(
            children: [
              for (final app in apps)
                ListTile(
                  leading: Avatar(glyph: app.icon),
                  title: Text(app.name),
                  subtitle: Text(
                    app.summary,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  trailing: Text(app.priceLabel,
                      style: Theme.of(context).textTheme.labelSmall),
                  onTap: () => Navigator.of(context).pushNamed(
                    'app.whatseek.apps.detail',
                    arguments: app.id,
                  ),
                ),
            ],
          ),
        ),
      ],
    );
  }
}
