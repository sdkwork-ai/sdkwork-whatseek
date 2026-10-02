/// Rule-based intent recognition over the PRD §10.1 core intent set — the
/// Dart port of `@sdkwork/whatseek-intent-core` (same rule order and zh/en
/// patterns; CREATE beats SEARCH for the same noun).
library;

class IntentResult {
  const IntentResult(this.intent, this.confidence, this.keywords);

  final String intent;
  final double confidence;
  final List<String> keywords;
}

class _IntentRule {
  const _IntentRule(this.intent, this.patterns, this.confidence);

  final String intent;
  final List<RegExp> patterns;
  final double confidence;
}

final List<_IntentRule> _rules = [
  _IntentRule('SEND_MESSAGE', [
    RegExp(r'(?:给|替)([\u4e00-\u9fa5a-zA-Z0-9]{2,8})(?:发|送|说|留言)'),
    RegExp(r'帮(?:我)?(?:给)?([\u4e00-\u9fa5a-zA-Z0-9]{2,8})(?:发消息|发个消息|发送|发信息|说)'),
    RegExp(r'联系(?:一下)?([\u4e00-\u9fa5a-zA-Z0-9]{2,8})'),
    RegExp(r'(发消息|发个消息|发送消息|发信息|send (?:a )?message)', caseSensitive: false),
  ], 0.9),
  _IntentRule('SEARCH_SUPPLIER', [
    RegExp(r'(供应商|供货商|supplier)', caseSensitive: false),
  ], 0.9),
  _IntentRule('SEARCH_PRODUCT', [
    RegExp(r'((?:找|采购|进|买|批发)[\u4e00-\u9fa5]{0,12}(?:商品|货|产品|原料))|(商品|产品)搜索'),
    RegExp(r'(采购|批发|进货)'),
  ], 0.8),
  _IntentRule('SEARCH_SERVICE', [
    RegExp(r'(服务商|外包|找.{0,6}服务|service provider)', caseSensitive: false),
  ], 0.8),
  _IntentRule('CREATE_AGENT', [
    RegExp(r'(?:创建|做一个|做个|生成|开发|搭)(?:一个|个)?[\s\S]{0,20}(agent|智能体|数字员工|自动化助手)',
        caseSensitive: false),
  ], 0.9),
  // USE_AGENT must precede SEARCH_AGENT: SEARCH_AGENT's bare-term branch
  // would otherwise swallow 派/让/用 + agent utterances (PRD §10.2).
  _IntentRule('USE_AGENT', [
    RegExp(r'(?:让|派|用)(?:一个|个|这个|那个)?[\s\S]{0,12}(?:agent|智能体|数字员工|AI 助手)(?:帮我|来|去)?',
        caseSensitive: false),
    RegExp(r'(?:帮我用|派个)(?:agent|智能体|数字员工)', caseSensitive: false),
  ], 0.8),
  _IntentRule('SEARCH_AGENT', [
    RegExp(r'((?:找|找一个|找个|推荐)(?:一个)?[\s\S]{0,16}(?:agent|智能体|数字员工))|(agent|智能体)',
        caseSensitive: false),
  ], 0.8),
  _IntentRule('CREATE_APP', [
    RegExp(
        r'(?:创建|做一个|做个|生成|开发|搭建|制作|写)(?:一个|个)?[\s\S]{0,16}(系统|应用|软件|网站|小程序|平台|app|工具|管理)',
        caseSensitive: false),
  ], 0.9),
  _IntentRule('CREATE_CONTENT', [
    RegExp(r'(?:生成|做|创建|写|画|拍)(?:一个|一张|一段|一篇|个|张|段|篇)?[\s\S]{0,12}(海报|图片|视频|文章|标题|文案|logo|插图|封面)',
        caseSensitive: false),
  ], 0.85),
  _IntentRule('EDIT_CONTENT', [
    RegExp(r'((?:修改|编辑|改成|换|调整)(?:一下)?[\s\S]{0,10}(?:图片|视频|文章|文案|标题|内容))|(把这张|把那个)',
        caseSensitive: false),
  ], 0.8),
  _IntentRule('USE_APP', [
    RegExp(r'((?:打开|运行|启动|使用)[\s\S]{0,8}(?:应用|app|软件|工具))|(打开[\s\S]{1,10})', caseSensitive: false),
  ], 0.75),
  _IntentRule('SEARCH_APP', [
    RegExp(r'(?:找|找找|找一个|找个|搜|搜索|推荐|有没有|想要|需要)(?:一个|个)?[\s\S]{0,12}(?:工具|应用|软件|app|平台)',
        caseSensitive: false),
    RegExp(r'(视频剪辑|图片编辑|标题生成|选品|剪辑|设计|记账|笔记|看板|crm|进销存)', caseSensitive: false),
  ], 0.85),
  _IntentRule('SEARCH_PERSON', [
    RegExp(r'(?:找|查|搜)(?:一下|找)?(?:联系人|张三|李四|王五|赵六)'),
    RegExp(r'联系人查找'),
  ], 0.8),
  _IntentRule('EXECUTE_TASK', [
    RegExp(r'(执行|帮我跑|跑一下|自动化)[\s\S]{0,10}'),
  ], 0.7),
];

/// Recognize the PRD intent for one user utterance. Always resolves —
/// GENERAL_CHAT is the fallback.
IntentResult recognizeIntent(String text) {
  final input = text.trim();
  if (input.isEmpty) {
    return const IntentResult('GENERAL_CHAT', 0.4, []);
  }
  for (final rule in _rules) {
    for (final pattern in rule.patterns) {
      final match = pattern.firstMatch(input);
      if (match != null) {
        final keyword = match.groupCount >= 1 ? (match.group(1) ?? '') : '';
        return IntentResult(
          rule.intent,
          rule.confidence,
          keyword.isEmpty ? const [] : [keyword],
        );
      }
    }
  }
  return const IntentResult('GENERAL_CHAT', 0.4, []);
}
