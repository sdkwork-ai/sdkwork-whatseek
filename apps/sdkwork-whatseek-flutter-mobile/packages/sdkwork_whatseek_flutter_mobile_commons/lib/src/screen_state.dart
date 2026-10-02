import 'package:flutter/material.dart';

import 'i18n/commons_strings.dart';

/// The five mandatory UI states (FRONTEND_CODE_SPEC §11 analog): loading,
/// empty, error, permissionDenied, success. `success` renders [child].
enum ScreenStateKind { loading, empty, error, permissionDenied, success }

class ScreenState extends StatelessWidget {
  const ScreenState({
    super.key,
    required this.state,
    this.title,
    this.message,
    this.onRetry,
    this.child,
  });

  final ScreenStateKind state;
  final String? title;
  final String? message;
  final VoidCallback? onRetry;
  final Widget? child;

  @override
  Widget build(BuildContext context) {
    if (state == ScreenStateKind.success) {
      return child ?? const SizedBox.shrink();
    }
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (state == ScreenStateKind.loading)
              const CircularProgressIndicator()
            else
              Text(
                switch (state) {
                  ScreenStateKind.empty => '🪄',
                  ScreenStateKind.error => '⚠️',
                  ScreenStateKind.permissionDenied => '🔒',
                  _ => '',
                },
                style: const TextStyle(fontSize: 40),
              ),
            const SizedBox(height: 12),
            Text(
              title ??
                  WhatseekCommonsStrings.of(context, 'state.${state.name}.title'),
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 4),
            Text(
              message ??
                  WhatseekCommonsStrings.of(
                      context, 'state.${state.name}.description'),
              style: Theme.of(context).textTheme.bodySmall,
              textAlign: TextAlign.center,
            ),
            if (state == ScreenStateKind.error && onRetry != null) ...[
              const SizedBox(height: 12),
              FilledButton(
                onPressed: onRetry,
                child: Text(WhatseekCommonsStrings.of(context, 'state.retry')),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
