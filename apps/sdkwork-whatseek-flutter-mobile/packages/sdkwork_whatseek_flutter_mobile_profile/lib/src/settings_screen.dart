import 'package:flutter/material.dart';

import "package:sdkwork_whatseek_flutter_mobile_core/sdkwork_whatseek_flutter_mobile_core.dart";

import 'i18n/profile_strings.dart';

/// Settings (PRD §35, H5 `SettingsScreen` parity): appearance
/// (system/light/dark), language (zh-CN/en-US), and the About section.
/// Changes apply immediately through the injected settings controller and
/// persist across restarts.
class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key, required this.settings});

  final WhatseekSettingsController settings;

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  @override
  void initState() {
    super.initState();
    widget.settings.addListener(_onSettingsChanged);
  }

  @override
  void didUpdateWidget(SettingsScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.settings != widget.settings) {
      oldWidget.settings.removeListener(_onSettingsChanged);
      widget.settings.addListener(_onSettingsChanged);
    }
  }

  @override
  void dispose() {
    widget.settings.removeListener(_onSettingsChanged);
    super.dispose();
  }

  void _onSettingsChanged() {
    if (mounted) {
      setState(() {});
    }
  }

  @override
  Widget build(BuildContext context) {
    final settings = widget.settings;
    return Scaffold(
      appBar: AppBar(title: Text(WhatseekProfileStrings.of(context, 'settings.title'))),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text(WhatseekProfileStrings.of(context, 'settings.darkMode'),
              style: Theme.of(context).textTheme.titleSmall),
          Text(WhatseekProfileStrings.of(context, 'settings.darkModeHint'),
              style: Theme.of(context).textTheme.bodySmall),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            children: [
              for (final appearance in WhatseekAppearance.values)
                ChoiceChip(
                  label: Text(WhatseekProfileStrings.of(context, 'settings.mode.${appearance.name}')),
                  selected: settings.appearance == appearance,
                  onSelected: (_) => settings.setAppearance(appearance),
                ),
            ],
          ),
          const SizedBox(height: 24),
          Text(WhatseekProfileStrings.of(context, 'settings.language'),
              style: Theme.of(context).textTheme.titleSmall),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            children: [
              for (final locale in kWhatseekLocales)
                ChoiceChip(
                  label: Text(WhatseekProfileStrings.of(
                      context, 'settings.locale.${_localeSuffix(locale)}')),
                  selected: settings.locale == locale,
                  onSelected: (_) => settings.setLocale(locale),
                ),
            ],
          ),
          const SizedBox(height: 24),
          Text(WhatseekProfileStrings.of(context, 'settings.about'),
              style: Theme.of(context).textTheme.titleSmall),
          ListTile(
            leading: const Text('✨', style: TextStyle(fontSize: 22)),
            title: Text(WhatseekProfileStrings.of(context, 'settings.brandTitle')),
            subtitle: Text(WhatseekProfileStrings.of(context, 'settings.brandMessage')),
          ),
          ListTile(
            leading: const Icon(Icons.info_outline),
            title: Text(WhatseekProfileStrings.of(context, 'settings.version')),
            trailing: const Text(kWhatseekAppVersion),
          ),
          ListTile(
            leading: const Icon(Icons.route),
            title: Text(WhatseekProfileStrings.of(context, 'settings.routeContracts')),
            trailing: Text('${kWhatseekRouteTable.length}'),
          ),
        ],
      ),
    );
  }

  /// Fragment key suffix for a BCP 47 tag: `zh-CN` -> `zhCN`, `en-US` -> `enUS`.
  static String _localeSuffix(String locale) {
    final parts = locale.split('-');
    if (parts.length < 2) {
      return locale;
    }
    return '${parts.first}${parts[1].toUpperCase()}';
  }
}
