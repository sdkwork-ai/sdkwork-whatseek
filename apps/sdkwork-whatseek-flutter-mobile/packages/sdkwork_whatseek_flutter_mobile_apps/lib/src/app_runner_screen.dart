import 'package:flutter/material.dart';

import "package:sdkwork_whatseek_flutter_mobile_core/sdkwork_whatseek_flutter_mobile_core.dart";
import "package:sdkwork_whatseek_flutter_mobile_commons/sdkwork_whatseek_flutter_mobile_commons.dart";

import 'i18n/apps_strings.dart';

/// In-app app runner (PRD 应用调用): opens the app through the injected apps
/// service (`openApp`), records it as recent, and renders the Phase 1 runtime
/// preview. Enterprise apps require a named (non-visitor) session — visitors
/// get the genuine permission-denied state with a back action (H5 parity).
class AppRunnerScreen extends StatefulWidget {
  const AppRunnerScreen({super.key, required this.appId, this.isVisitor = false});

  final String appId;
  final bool isVisitor;

  @override
  State<AppRunnerScreen> createState() => _AppRunnerScreenState();
}

enum _RunnerState { loading, error, notFound, permissionDenied, ready }

class _AppRunnerScreenState extends State<AppRunnerScreen> {
  _RunnerState _state = _RunnerState.loading;
  WhatseekApp? _app;

  @override
  void initState() {
    super.initState();
    _open();
  }

  Future<void> _open() async {
    setState(() {
      _state = _RunnerState.loading;
    });
    try {
      final app = await WhatseekRuntime.instance.apps
          .openApp(widget.appId, isVisitor: widget.isVisitor);
      setState(() {
        if (app == null) {
          _state = _RunnerState.notFound;
        } else {
          _app = app;
          _state = _RunnerState.ready;
        }
      });
    } on WhatseekPermissionDeniedException {
      setState(() {
        _state = _RunnerState.permissionDenied;
      });
    } on Exception {
      setState(() {
        _state = _RunnerState.error;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(WhatseekAppsStrings.of(context, 'runner.title'))),
      body: switch (_state) {
        _RunnerState.loading => const ScreenState(state: ScreenStateKind.loading),
        _RunnerState.error => ScreenState(
            state: ScreenStateKind.error,
            onRetry: _open,
          ),
        _RunnerState.notFound => ScreenState(
            state: ScreenStateKind.empty,
            title: WhatseekAppsStrings.of(context, 'detail.notFound'),
          ),
        _RunnerState.permissionDenied => _buildPermissionDenied(context),
        _RunnerState.ready => _buildPreview(context, _app!),
      },
    );
  }

  Widget _buildPermissionDenied(BuildContext context) {
    return Column(
      children: [
        Expanded(
          child: ScreenState(
            state: ScreenStateKind.permissionDenied,
            message: WhatseekAppsStrings.of(context, 'runner.previewNote'),
          ),
        ),
        SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: FilledButton.tonal(
              onPressed: () => Navigator.of(context).maybePop(),
              child: Text(WhatseekCommonsStrings.of(context, 'action.back')),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildPreview(BuildContext context, WhatseekApp app) {
    final scheme = Theme.of(context).colorScheme;
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
          child: Row(
            children: [
              Expanded(
                child: Text(
                  '${app.name} · ${WhatseekAppsStrings.of(context, 'runner.running')}',
                  style: Theme.of(context).textTheme.titleSmall,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              Container(
                width: 8,
                height: 8,
                decoration: BoxDecoration(
                  color: scheme.primary,
                  shape: BoxShape.circle,
                ),
              ),
            ],
          ),
        ),
        Expanded(
          child: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Avatar(glyph: app.icon, size: 64),
                const SizedBox(height: 12),
                Text(app.name, style: Theme.of(context).textTheme.titleMedium),
                const SizedBox(height: 4),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 32),
                  child: Text(
                    app.summary,
                    style: Theme.of(context).textTheme.bodySmall,
                    textAlign: TextAlign.center,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                const SizedBox(height: 8),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 32),
                  child: Text(
                    WhatseekAppsStrings.of(context, 'runner.previewNote'),
                    style: Theme.of(context).textTheme.bodySmall,
                    textAlign: TextAlign.center,
                  ),
                ),
                const SizedBox(height: 16),
                FractionallySizedBox(
                  widthFactor: 0.8,
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: scheme.surfaceContainerHighest,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: scheme.outlineVariant),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        FractionallySizedBox(
                          widthFactor: 0.5,
                          child: Container(
                            height: 12,
                            decoration: BoxDecoration(
                              color: scheme.surfaceContainerHigh,
                              borderRadius: BorderRadius.circular(6),
                            ),
                          ),
                        ),
                        const SizedBox(height: 8),
                        for (final width in <double>[1.0, 0.75]) ...[
                          FractionallySizedBox(
                            widthFactor: width,
                            child: Container(
                              height: 12,
                              decoration: BoxDecoration(
                                color: scheme.surfaceContainerHigh,
                                borderRadius: BorderRadius.circular(6),
                              ),
                            ),
                          ),
                          const SizedBox(height: 8),
                        ],
                        Container(
                          width: double.infinity,
                          height: 32,
                          decoration: BoxDecoration(
                            color: scheme.primaryContainer,
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
