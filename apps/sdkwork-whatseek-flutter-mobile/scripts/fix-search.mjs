// One-shot patcher: add TS-equivalent keyword extraction to the Dart apps client.
import { readFileSync, writeFileSync } from 'node:fs';

const p = 'packages/sdkwork_whatseek_flutter_mobile_core/lib/src/mock/apps_client.dart';
let t = readFileSync(p, 'utf8');

const brokenSearch = /  Future<List<AppRecommendation>> searchApps\(String query\) async \{\n    final keywords = query[\s\S]*?\.toList\(\);\n/u;
if (!brokenSearch.test(t)) {
  console.error('searchApps signature not found — aborting');
  process.exit(1);
}
t = t.replace(
  brokenSearch,
  '  Future<List<AppRecommendation>> searchApps(String query) async {\n    final keywords = extractSearchKeywords(query);\n',
);

t += `
/// Keyword extraction for natural-language search — the Dart port of the TS
/// \`extractSearchKeywords\` (stopword stripping keeps zh/en domain tokens).
List<String> extractSearchKeywords(String query) {
  const stopwords = [
    '帮我', '找一个', '找一下', '想要', '需要', '有没有', '推荐', '适合', '支持',
    '可以', '一个', '一款', '工具', '软件', '应用', '的', '了', '吗', '呢', '和',
    '跟', '与', '还有', 'please', 'find', 'search', 'look', 'for', 'want',
    'need', 'recommend', 'suitable', 'tool', 'software', 'application', 'app',
    'a', 'an', 'the', 'me', 'my', 'with', 'that',
  ];
  final normalized = query.toLowerCase().trim();
  if (normalized.isEmpty) {
    return const [];
  }
  final keywords = <String>[];
  for (final segment in normalized.split(RegExp(r'[\\s,，。.、;；!！?？/\\\\]+'))) {
    var remaining = segment;
    for (final stopword in stopwords) {
      remaining = remaining.split(stopword).join(' ');
    }
    for (final token in remaining.split(RegExp(r'\\s+'))) {
      if (token.isNotEmpty && !keywords.contains(token)) {
        keywords.add(token);
      }
    }
  }
  return keywords;
}
`;

writeFileSync(p, t);
console.log('extractor added');
