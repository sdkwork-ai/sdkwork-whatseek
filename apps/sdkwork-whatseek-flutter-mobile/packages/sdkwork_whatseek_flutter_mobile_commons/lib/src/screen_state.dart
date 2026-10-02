import 'package:flutter/material.dart';

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
                  switch (state) {
                    ScreenStateKind.loading => '加载中…',
                    ScreenStateKind.empty => '这里还空空如也',
                    ScreenStateKind.error => '出错了',
                    ScreenStateKind.permissionDenied => '没有权限',
                    _ => '',
                  },
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 4),
            Text(
              message ??
                  switch (state) {
                    ScreenStateKind.loading => '正在为你获取内容',
                    ScreenStateKind.empty => '换个方式试试，或者直接告诉问寻你想做什么',
                    ScreenStateKind.error => '内容没有加载成功，请重试',
                    ScreenStateKind.permissionDenied => '当前账号无权访问该内容',
                    _ => '',
                  },
              style: Theme.of(context).textTheme.bodySmall,
              textAlign: TextAlign.center,
            ),
            if (state == ScreenStateKind.error && onRetry != null) ...[
              const SizedBox(height: 12),
              FilledButton(onPressed: onRetry, child: const Text('重试')),
            ],
          ],
        ),
      ),
    );
  }
}
