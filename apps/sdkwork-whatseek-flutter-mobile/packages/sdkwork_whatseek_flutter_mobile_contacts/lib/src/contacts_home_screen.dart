import 'package:flutter/material.dart';

import "package:sdkwork_whatseek_flutter_mobile_core/sdkwork_whatseek_flutter_mobile_core.dart";
import "package:sdkwork_whatseek_flutter_mobile_commons/sdkwork_whatseek_flutter_mobile_commons.dart";

/// 通讯录 tab root: unified people/groups/orgs/agents directory.
class ContactsHomeScreen extends StatefulWidget {
  const ContactsHomeScreen({super.key});

  @override
  State<ContactsHomeScreen> createState() => _ContactsHomeScreenState();
}

class _ContactsHomeScreenState extends State<ContactsHomeScreen> {
  late Future<List<Contact>> _contacts;

  @override
  void initState() {
    super.initState();
    _contacts = WhatseekRuntime.instance.contacts.listContacts();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('通讯录')),
      body: FutureBuilder<List<Contact>>(
        future: _contacts,
        builder: (context, snapshot) {
          if (snapshot.connectionState != ConnectionState.done) {
            return const ScreenState(state: ScreenStateKind.loading);
          }
          final contacts = snapshot.data ?? const <Contact>[];
          return ListView(
            children: [
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
      ),
    );
  }
}
