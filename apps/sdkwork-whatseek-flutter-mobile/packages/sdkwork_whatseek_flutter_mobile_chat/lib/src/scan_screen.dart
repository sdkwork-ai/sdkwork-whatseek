import 'dart:async';
import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';

import 'i18n/chat_strings.dart';

/// How the user leaves the scan-result sheet: scan another code, or go back to
/// the chat with the result read.
enum _ScanResultAction { rescan, done }

/// Full-screen QR/barcode scanner opened from the 对话 navbar "+" menu.
///
/// The plugin requests camera permission on first start; the branded frame and
/// hint keep the preview legible. A capture stops the camera and opens a
/// result sheet, so the same code never triggers a second sheet.
class ScanScreen extends StatefulWidget {
  const ScanScreen({super.key});

  @override
  State<ScanScreen> createState() => _ScanScreenState();
}

class _ScanScreenState extends State<ScanScreen> {
  late final MobileScannerController _controller = MobileScannerController(
    detectionSpeed: DetectionSpeed.noDuplicates,
    formats: const <BarcodeFormat>[
      BarcodeFormat.qrCode,
      BarcodeFormat.code128,
      BarcodeFormat.ean13,
    ],
  );

  /// A capture stops the camera and opens the result sheet once; the flag
  /// keeps the remaining frames of the same code from re-opening it.
  bool _handled = false;

  @override
  void dispose() {
    unawaited(_controller.dispose());
    super.dispose();
  }

  Future<void> _handleCapture(BarcodeCapture capture) async {
    if (_handled) {
      return;
    }
    final String code = _firstValue(capture);
    if (code.isEmpty) {
      return;
    }
    _handled = true;
    await _controller.stop();
    if (!mounted) {
      return;
    }
    await _showResult(code);
  }

  static String _firstValue(BarcodeCapture capture) {
    for (final Barcode barcode in capture.barcodes) {
      final String? value = barcode.rawValue;
      if (value != null && value.trim().isNotEmpty) {
        return value.trim();
      }
    }
    return '';
  }

  Future<void> _showResult(String code) async {
    final _ScanResultAction? action =
        await showModalBottomSheet<_ScanResultAction>(
      context: context,
      showDragHandle: true,
      isScrollControlled: true,
      builder: (BuildContext sheetContext) {
        final TextTheme textTheme = Theme.of(sheetContext).textTheme;
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  WhatseekChatStrings.of(sheetContext, 'scan.resultTitle'),
                  style: textTheme.titleMedium,
                ),
                const SizedBox(height: 12),
                ConstrainedBox(
                  constraints: const BoxConstraints(maxHeight: 160),
                  child: SingleChildScrollView(
                    child: SelectableText(code),
                  ),
                ),
                const SizedBox(height: 20),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () => Navigator.of(sheetContext)
                            .pop(_ScanResultAction.done),
                        child: Text(
                          WhatseekChatStrings.of(sheetContext, 'scan.done'),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: FilledButton(
                        onPressed: () => Navigator.of(sheetContext)
                            .pop(_ScanResultAction.rescan),
                        child: Text(
                          WhatseekChatStrings.of(sheetContext, 'scan.rescan'),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
    if (!mounted) {
      return;
    }
    switch (action) {
      case _ScanResultAction.done:
        Navigator.of(context).pop();
      case _ScanResultAction.rescan:
      case null:
        // Barrier dismiss keeps the scanner alive for the next code.
        await _restart();
    }
  }

  Future<void> _restart() async {
    _handled = false;
    try {
      await _controller.start();
    } on MobileScannerException {
      // The preview reports the failure through `errorBuilder`.
    }
  }

  Future<void> _toggleTorch() async {
    try {
      await _controller.toggleTorch();
    } on MobileScannerException {
      // Devices without a torch simply keep the off icon.
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(WhatseekChatStrings.of(context, 'scan.title')),
        actions: [
          ValueListenableBuilder<MobileScannerState>(
            valueListenable: _controller,
            builder: (BuildContext context, MobileScannerState state, _) {
              final bool isOn = state.torchState == TorchState.on;
              return IconButton(
                onPressed: _toggleTorch,
                icon: Icon(isOn ? Icons.flash_on : Icons.flash_off),
                tooltip: WhatseekChatStrings.of(
                  context,
                  isOn ? 'scan.torchOff' : 'scan.torchOn',
                ),
              );
            },
          ),
        ],
      ),
      body: MobileScanner(
        controller: _controller,
        onDetect: _handleCapture,
        errorBuilder: _buildError,
        placeholderBuilder: (BuildContext context) => const ColoredBox(
          color: Colors.black,
          child: Center(child: CircularProgressIndicator()),
        ),
        overlayBuilder: (BuildContext context, BoxConstraints constraints) =>
            _buildOverlay(context, constraints),
      ),
    );
  }

  Widget _buildOverlay(BuildContext context, BoxConstraints constraints) {
    final double frameSide =
        math.min(constraints.maxWidth * 0.68, constraints.maxHeight * 0.4);
    return Stack(
      alignment: Alignment.center,
      children: [
        Center(
          child: Container(
            width: frameSide,
            height: frameSide,
            decoration: BoxDecoration(
              border: Border.all(color: Colors.white, width: 3),
              borderRadius: BorderRadius.circular(24),
            ),
          ),
        ),
        Positioned(
          left: 24,
          right: 24,
          bottom: 48,
          child: Text(
            WhatseekChatStrings.of(context, 'scan.hint'),
            textAlign: TextAlign.center,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 14,
              shadows: [
                Shadow(blurRadius: 6, color: Colors.black54),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildError(BuildContext context, MobileScannerException error) {
    final (String titleKey, String descriptionKey) = switch (error.errorCode) {
      MobileScannerErrorCode.permissionDenied => (
          'scan.permissionDeniedTitle',
          'scan.permissionDeniedDescription',
        ),
      MobileScannerErrorCode.unsupported => (
          'scan.unsupportedTitle',
          'scan.unsupportedDescription',
        ),
      _ => ('scan.errorTitle', 'scan.errorDescription'),
    };
    final ThemeData theme = Theme.of(context);
    return ColoredBox(
      color: theme.colorScheme.surface,
      child: Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                Icons.no_photography_outlined,
                size: 48,
                color: theme.colorScheme.error,
              ),
              const SizedBox(height: 16),
              Text(
                WhatseekChatStrings.of(context, titleKey),
                textAlign: TextAlign.center,
                style: theme.textTheme.titleMedium,
              ),
              const SizedBox(height: 8),
              Text(
                WhatseekChatStrings.of(context, descriptionKey),
                textAlign: TextAlign.center,
                style: theme.textTheme.bodyMedium,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
