import 'package:flutter/material.dart';

/// Emoji-glyph avatar tile shared by contacts, messages, and app lists.
class Avatar extends StatelessWidget {
  const Avatar({super.key, required this.glyph, this.size = 44});

  final String glyph;
  final double size;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Container(
      width: size,
      height: size,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: scheme.primaryContainer,
        borderRadius: BorderRadius.circular(size * 0.3),
      ),
      child: Text(glyph, style: TextStyle(fontSize: size * 0.5)),
    );
  }
}
