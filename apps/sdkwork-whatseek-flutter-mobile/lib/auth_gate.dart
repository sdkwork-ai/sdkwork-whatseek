import 'package:flutter/material.dart';

import 'bootstrap/iam_runtime.dart';

/// Session gate: guarantees a session exists before rendering the child tree
/// (mirrors the H5/PC AuthGate; Phase 2 binds the IAM login integration).
class AuthGate extends StatelessWidget {
  const AuthGate({super.key, required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    WhatseekIamRuntime.instance.ensureSession();
    return child;
  }
}
