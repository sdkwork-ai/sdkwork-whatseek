import 'package:flutter/material.dart';

import "package:sdkwork_whatseek_flutter_mobile_core/sdkwork_whatseek_flutter_mobile_core.dart";
import "package:sdkwork_whatseek_flutter_mobile_commons/sdkwork_whatseek_flutter_mobile_commons.dart";

import 'i18n/contacts_strings.dart';

/// 通讯录 kind segments (PRD §26): 全部 plus one segment per contact kind
/// (H5 `ContactsHomeScreen` SEGMENTS parity).
const List<(ContactKind?, String)> _kContactSegments = [
  (null, 'home.segment.all'),
  (ContactKind.person, 'home.segment.person'),
  (ContactKind.group, 'home.segment.group'),
  (ContactKind.org, 'home.segment.org'),
  (ContactKind.agent, 'home.segment.agent'),
  (ContactKind.assistant, 'home.segment.assistant'),
];

/// 通讯录 tab root (PRD §26): submit-driven search over the unified
/// people/groups/orgs/agents directory, filtered by kind segment (H5
/// `ContactsHomeScreen` parity).
class ContactsHomeScreen extends StatefulWidget {
  const ContactsHomeScreen({super.key});

  @override
  State<ContactsHomeScreen> createState() => _ContactsHomeScreenState();
}

class _ContactsHomeScreenState extends State<ContactsHomeScreen> {
  late Future<List<Contact>> _contacts;
  String _query = '';
  ContactKind? _segment;

  @override
  void initState() {
    super.initState();
    _reload();
  }

  void _reload() {
    setState(() {
      // An empty query resolves to the full directory (`searchContacts`
      // returns everything for whitespace input), so one call covers both
      // the browse and the search path.
      _contacts = WhatseekRuntime.instance.contacts.searchContacts(_query);
    });
  }

  void _submit(String draft) {
    setState(() {
      _query = draft.trim();
      _contacts = WhatseekRuntime.instance.contacts.searchContacts(_query);
    });
  }

  void _selectSegment(ContactKind? kind) {
    setState(() {
      _segment = kind;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(WhatseekContactsStrings.of(context, 'home.title'))),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              decoration: InputDecoration(
                hintText:
                    WhatseekContactsStrings.of(context, 'home.searchPlaceholder'),
                prefixIcon: const Icon(Icons.search),
                border: const OutlineInputBorder(
                    borderRadius: BorderRadius.all(Radius.circular(24))),
                isDense: true,
              ),
              onSubmitted: _submit,
            ),
          ),
          _buildSegments(context),
          Expanded(child: _buildDirectory(context)),
        ],
      ),
    );
  }

  Widget _buildSegments(BuildContext context) {
    return SizedBox(
      height: 44,
      child: ListView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        children: [
          for (final (kind, labelKey) in _kContactSegments)
            Padding(
              padding: const EdgeInsetsDirectional.only(end: 8),
              child: ChoiceChip(
                label: Text(WhatseekContactsStrings.of(context, labelKey)),
                selected: _segment == kind,
                visualDensity: VisualDensity.compact,
                onSelected: (_) => _selectSegment(kind),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildDirectory(BuildContext context) {
    return FutureBuilder<List<Contact>>(
      future: _contacts,
      builder: (context, snapshot) {
        if (snapshot.connectionState != ConnectionState.done) {
          return const ScreenState(state: ScreenStateKind.loading);
        }
        if (snapshot.hasError) {
          return ScreenState(state: ScreenStateKind.error, onRetry: _reload);
        }
        final contacts = (snapshot.data ?? const <Contact>[])
            .where((contact) => _segment == null || contact.kind == _segment)
            .toList();
        if (contacts.isEmpty) {
          return ScreenState(
            state: ScreenStateKind.empty,
            title: WhatseekContactsStrings.of(context, 'home.emptyTitle'),
          );
        }
        return ListView(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 4, 16, 8),
              child: Text(
                WhatseekContactsStrings.of(
                    context, 'home.listTitle', {'count': contacts.length}),
                style: Theme.of(context).textTheme.bodySmall,
              ),
            ),
            for (final contact in contacts)
              ListTile(
                leading: Avatar(glyph: contact.avatar),
                title: Text(contact.name),
                subtitle: Text(contact.bio),
                onTap: () => Navigator.of(context).pushNamed(
                  'app.whatseek.contacts.detail',
                  arguments: contact.id,
                ),
              ),
          ],
        );
      },
    );
  }
}
