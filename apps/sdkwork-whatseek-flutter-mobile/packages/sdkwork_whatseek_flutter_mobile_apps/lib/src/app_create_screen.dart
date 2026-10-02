import 'package:flutter/material.dart';

import "package:sdkwork_whatseek_flutter_mobile_core/sdkwork_whatseek_flutter_mobile_core.dart";

import 'i18n/apps_strings.dart';

/// AI app creation flow (PRD §17/§18): requirement → plan → generate → preview
/// → publish to 我的应用.
class AppCreateScreen extends StatefulWidget {
  const AppCreateScreen({super.key, this.initialRequirement = ''});

  final String initialRequirement;

  @override
  State<AppCreateScreen> createState() => _AppCreateScreenState();
}

class _AppCreateScreenState extends State<AppCreateScreen> {
  final TextEditingController _requirement = TextEditingController();
  ({List<String> modules, String title})? _plan;
  CreatedApp? _created;
  bool _generating = false;

  @override
  void initState() {
    super.initState();
    _requirement.text = widget.initialRequirement;
  }

  Future<void> _makePlan() async {
    final requirement = _requirement.text.trim();
    if (requirement.isEmpty) {
      return;
    }
    setState(() {
      _plan = WhatseekRuntime.instance.apps.draftCreationPlan(requirement);
      _created = null;
    });
  }

  Future<void> _generate() async {
    final plan = _plan;
    if (plan == null || _generating) {
      return;
    }
    setState(() {
      _generating = true;
    });
    final created = await WhatseekRuntime.instance.apps
        .createAppFromPlan(_requirement.text.trim(), plan.modules);
    setState(() {
      _created = created;
      _generating = false;
    });
  }

  Future<void> _publish() async {
    final created = _created;
    if (created == null) {
      return;
    }
    final published = await WhatseekRuntime.instance.apps.publishApp(created.id);
    setState(() {
      _created = published;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(WhatseekAppsStrings.of(context, 'create.title'))),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          TextField(
            controller: _requirement,
            maxLines: 3,
            decoration: InputDecoration(
              hintText: WhatseekAppsStrings.of(context, 'create.placeholder'),
              border: const OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 12),
          FilledButton(
            onPressed: _makePlan,
            child: Text(WhatseekAppsStrings.of(context, 'create.planAction')),
          ),
          if (_plan != null) ...[
            const SizedBox(height: 16),
            Text(_plan!.title, style: Theme.of(context).textTheme.titleMedium),
            for (final module in _plan!.modules) Text('✓ $module'),
            const SizedBox(height: 12),
            FilledButton(
              onPressed: _generating ? null : _generate,
              child: Text(WhatseekAppsStrings.of(context, 'create.generateAction')),
            ),
          ],
          if (_generating) const Padding(
            padding: EdgeInsets.all(24),
            child: Center(child: CircularProgressIndicator()),
          ),
          if (_created != null) ...[
            const SizedBox(height: 16),
            Text(
              WhatseekAppsStrings.of(context, 'create.previewTitle', {'name': _created!.name}),
              style: Theme.of(context).textTheme.titleMedium,
            ),
            Text(
              '${WhatseekAppsStrings.of(context, 'create.moduleCount', {'count': _created!.modules.length})}'
              ' · v${_created!.versions.last}',
            ),
            const SizedBox(height: 12),
            if (_created!.lifecycle == CreatedAppLifecycle.published)
              Text(
                WhatseekAppsStrings.of(context, 'create.published'),
                style: TextStyle(color: Theme.of(context).colorScheme.primary),
              )
            else
              FilledButton(
                onPressed: _publish,
                child: Text(WhatseekAppsStrings.of(context, 'create.publishAction')),
              ),
          ],
        ],
      ),
    );
  }
}
