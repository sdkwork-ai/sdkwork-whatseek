// One-shot patcher: extract the contact name in the Dart SEND_MESSAGE branch.
import { readFileSync, writeFileSync } from 'node:fs';

const p = 'packages/sdkwork_whatseek_flutter_mobile_core/lib/src/mock/clients.dart';
let t = readFileSync(p, 'utf8');

const broken = "      case 'SEND_MESSAGE':\n        final matches = await contacts.searchContacts(trimmed);";
const fixed = [
  "      case 'SEND_MESSAGE':",
  "        final name = extractContactName(trimmed);",
  "        final matches = name != null",
  "            ? await contacts.searchContacts(name)",
  "            : await contacts.listContacts();",
];
if (!t.includes(broken)) {
  console.error('SEND_MESSAGE branch not found — aborting');
  process.exit(1);
}
t = t.split(broken).join(fixed.join('\n'));

t += `
/// Extract the contact name from a send-message utterance — the Dart port of
/// the TS \`extractContactName\`.
String? extractContactName(String text) {
  final patterns = [
    RegExp(r'(?:给|替|帮[\u4e00-\u9fa5]{0,2}?)([\u4e00-\u9fa5a-zA-Z0-9]{2,8})(?:发|送|说|留言|发消息)'),
    RegExp(r'联系(?:一下)?([\u4e00-\u9fa5a-zA-Z0-9]{2,8})'),
    RegExp(r'找([\u4e00-\u9fa5a-zA-Z0-9]{2,8})(?:发消息|说|留言)'),
  ];
  for (final pattern in patterns) {
    final match = pattern.firstMatch(text);
    final name = match?.group(1);
    if (name != null && name.isNotEmpty) {
      return name;
    }
  }
  return null;
}
`;

writeFileSync(p, t);
console.log('contact-name extraction added');
