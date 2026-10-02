import 'package:flutter/material.dart';

import "package:sdkwork_whatseek_flutter_mobile_core/sdkwork_whatseek_flutter_mobile_core.dart";
import "package:sdkwork_whatseek_flutter_mobile_commons/sdkwork_whatseek_flutter_mobile_commons.dart";

import 'i18n/contacts_strings.dart';

/// Contact detail (PRD §26): profile, tags, company, and a 发消息 action that
/// opens (or creates) the direct conversation.
class ContactDetailScreen extends StatefulWidget {
  const ContactDetailScreen({super.key, required this.contactId});

  final String contactId;

  @override
  State<ContactDetailScreen> createState() => _ContactDetailScreenState();
}

class _ContactDetailScreenState extends State<ContactDetailScreen> {
  late Future<Contact?> _contact;

  @override
  void initState() {
    super.initState();
    _contact = WhatseekRuntime.instance.contacts.getContact(widget.contactId);
  }

  Future<void> _openConversation(BuildContext context, Contact contact) async {
    final conversation =
        await WhatseekRuntime.instance.messages.openDirectConversation(contact.id);
    if (context.mounted) {
      Navigator.of(context).pushNamed(
        'app.whatseek.messages.conversation',
        arguments: conversation.id,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(WhatseekContactsStrings.of(context, 'detail.title'))),
      body: FutureBuilder<Contact?>(
        future: _contact,
        builder: (context, snapshot) {
          if (snapshot.connectionState != ConnectionState.done) {
            return const ScreenState(state: ScreenStateKind.loading);
          }
          final contact = snapshot.data;
          if (contact == null) {
            return ScreenState(
              state: ScreenStateKind.empty,
              title: WhatseekContactsStrings.of(context, 'detail.notFound'),
            );
          }
          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Center(
                child: Column(
                  children: [
                    Avatar(glyph: contact.avatar, size: 72),
                    const SizedBox(height: 12),
                    Text(contact.name, style: Theme.of(context).textTheme.titleLarge),
                    Text(contact.bio, style: Theme.of(context).textTheme.bodySmall),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              if (contact.company != null) ...[
                Text(WhatseekContactsStrings.of(context, 'detail.company'),
                    style: Theme.of(context).textTheme.titleSmall),
                Text(contact.company!),
              ],
              const SizedBox(height: 24),
              FilledButton(
                onPressed: () => _openConversation(context, contact),
                child: Text(WhatseekContactsStrings.of(context, 'detail.sendMessage')),
              ),
            ],
          );
        },
      ),
    );
  }
}
