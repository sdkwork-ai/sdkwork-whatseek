// One-shot patcher: align Dart tab titleKeys with the TS route table + stable sort.
import { readFileSync, writeFileSync } from 'node:fs';

const routeTablePath = 'packages/sdkwork_whatseek_flutter_mobile_core/lib/src/route_table.dart';
let routeTable = readFileSync(routeTablePath, 'utf8');
const fixes = [
  ['whatseek.shell.tab.chat', 'whatseek.chat.home.title'],
  ['whatseek.shell.tab.apps', 'whatseek.apps.home.title'],
  ['whatseek.shell.tab.contacts', 'whatseek.contacts.home.title'],
  ['whatseek.shell.tab.messages', 'whatseek.messages.home.title'],
  ['whatseek.shell.tab.profile', 'whatseek.profile.home.title'],
];
for (const [from, to] of fixes) {
  routeTable = routeTable.split(`'${from}'`).join(`'${to}'`);
}
writeFileSync(routeTablePath, routeTable);

const clientsPath = 'packages/sdkwork_whatseek_flutter_mobile_core/lib/src/mock/clients.dart';
let clients = readFileSync(clientsPath, 'utf8');
clients = clients
  .split('(b.updatedAt ?? DateTime.now()).compareTo(a.updatedAt ?? DateTime.now())')
  .join('(b.updatedAt ?? DateTime(0)).compareTo(a.updatedAt ?? DateTime(0))');
writeFileSync(clientsPath, clients);

console.log('titleKeys aligned + sort stabilized');
