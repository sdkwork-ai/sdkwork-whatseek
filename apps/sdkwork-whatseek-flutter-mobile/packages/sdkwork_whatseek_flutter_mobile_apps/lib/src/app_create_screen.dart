import 'package:flutter/material.dart';

import "package:sdkwork_whatseek_flutter_mobile_core/sdkwork_whatseek_flutter_mobile_core.dart";

import 'i18n/apps_strings.dart';

/// AI app creation flow (PRD §17/§18/§43): requirement → plan → generate →
/// preview → continue modifying → publish to 我的应用 (H5 `AppCreateScreen`
/// parity).
class AppCreateScreen extends StatefulWidget {
  const AppCreateScreen({super.key, this.initialRequirement = ''});

  final String initialRequirement;

  @override
  State<AppCreateScreen> createState() => _AppCreateScreenState();
}

class _AppCreateScreenState extends State<AppCreateScreen> {
  final TextEditingController _requirement = TextEditingController();
  final TextEditingController _instruction = TextEditingController();
  ({List<String> modules, List<String> pages, List<String> dataModel, String title})? _plan;
  CreatedApp? _created;
  bool _generating = false;
  bool _modifying = false;

  @override
  void initState() {
    super.initState();
    _requirement.text = widget.initialRequirement;
  }

  @override
  void dispose() {
    _requirement.dispose();
    _instruction.dispose();
    super.dispose();
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

  /// Applies a follow-up instruction to the generated app and refreshes the
  /// preview (H5 `AppCreateScreen.applyInstruction` semantics).
  Future<void> _applyInstruction() async {
    final created = _created;
    final instruction = _instruction.text.trim();
    if (created == null || instruction.isEmpty || _modifying) {
      return;
    }
    setState(() {
      _modifying = true;
    });
    final updated =
        await WhatseekRuntime.instance.apps.modifyApp(created.id, instruction);
    setState(() {
      _created = updated;
      _instruction.clear();
      _modifying = false;
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
            // PRD §3 plan chain: 页面规划 + 数据模型规划 artifacts.
            Text(WhatseekAppsStrings.of(context, 'create.planPages'),
                style: Theme.of(context).textTheme.titleSmall),
            for (final page in _plan!.pages) Text('✓ $page'),
            Text(WhatseekAppsStrings.of(context, 'create.planDataModel'),
                style: Theme.of(context).textTheme.titleSmall),
            for (final entity in _plan!.dataModel) Text('✓ $entity'),
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
            else ...[
              TextField(
                controller: _instruction,
                decoration: InputDecoration(
                  hintText:
                      WhatseekAppsStrings.of(context, 'create.modifyPlaceholder'),
                  border: const OutlineInputBorder(),
                  isDense: true,
                ),
                onSubmitted: (_) => _applyInstruction(),
              ),
              const SizedBox(height: 8),
              OutlinedButton(
                onPressed: _modifying ? null : _applyInstruction,
                child: Text(WhatseekAppsStrings.of(context, 'create.modifyAction')),
              ),
              const SizedBox(height: 12),
              FilledButton(
                onPressed: _publish,
                child: Text(WhatseekAppsStrings.of(context, 'create.publishAction')),
              ),
            ],
          ],
        ],
      ),
    );
  }
}
