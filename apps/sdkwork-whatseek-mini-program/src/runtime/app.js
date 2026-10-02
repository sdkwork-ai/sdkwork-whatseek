"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// <define:__SDKWORK_RUNTIME_ENV__>
var define_SDKWORK_RUNTIME_ENV_default;
var init_define_SDKWORK_RUNTIME_ENV = __esm({
  "<define:__SDKWORK_RUNTIME_ENV__>"() {
    define_SDKWORK_RUNTIME_ENV_default = { environment: "development", deploymentProfile: "standalone", profileId: "standalone.development", runtimeTarget: "mini-program", appApiBaseUrl: "/", sdkBaseUrl: "/" };
  }
});

// ../sdkwork-whatseek-common/packages/sdkwork-whatseek-service-core/src/inventory.ts
function registerWhatseekClient(name, implementation) {
  if (registry.has(name)) {
    throw new Error(`whatseek client already registered: ${name}`);
  }
  registry.set(name, implementation);
}
function getWhatseekClient(name) {
  const implementation = registry.get(name);
  if (!implementation) {
    throw new Error(
      `whatseek client not registered: ${name}. Register it in src/bootstrap/sdkClients.ts before rendering screens.`
    );
  }
  return implementation;
}
function resetWhatseekClients() {
  registry.clear();
}
var registry;
var init_inventory = __esm({
  "../sdkwork-whatseek-common/packages/sdkwork-whatseek-service-core/src/inventory.ts"() {
    "use strict";
    init_define_SDKWORK_RUNTIME_ENV();
    registry = /* @__PURE__ */ new Map();
  }
});

// ../sdkwork-whatseek-common/packages/sdkwork-whatseek-service-core/src/apps/catalog.ts
function planModulesForRequirement(requirement) {
  const lower = requirement.toLowerCase();
  const matched = /* @__PURE__ */ new Set();
  for (const plan of CREATION_MODULE_PLANS) {
    if (plan.match.some((keyword) => lower.includes(keyword))) {
      for (const moduleName of plan.modules) {
        matched.add(moduleName);
      }
    }
  }
  if (matched.size === 0) {
    return [...DEFAULT_CREATION_MODULES];
  }
  return [...matched];
}
var WHATSEEK_CATEGORIES, WHATSEEK_CATALOG, CREATION_MODULE_PLANS, DEFAULT_CREATION_MODULES;
var init_catalog = __esm({
  "../sdkwork-whatseek-common/packages/sdkwork-whatseek-service-core/src/apps/catalog.ts"() {
    "use strict";
    init_define_SDKWORK_RUNTIME_ENV();
    WHATSEEK_CATEGORIES = [
      { id: "efficiency", labelKey: "whatseek.apps.category.efficiency", icon: "\u26A1" },
      { id: "office", labelKey: "whatseek.apps.category.office", icon: "\u{1F5C2}\uFE0F" },
      { id: "coding", labelKey: "whatseek.apps.category.coding", icon: "\u{1F4BB}" },
      { id: "design", labelKey: "whatseek.apps.category.design", icon: "\u{1F3A8}" },
      { id: "image", labelKey: "whatseek.apps.category.image", icon: "\u{1F5BC}\uFE0F" },
      { id: "video", labelKey: "whatseek.apps.category.video", icon: "\u{1F3AC}" },
      { id: "audio", labelKey: "whatseek.apps.category.audio", icon: "\u{1F3A7}" },
      { id: "ecommerce", labelKey: "whatseek.apps.category.ecommerce", icon: "\u{1F6D2}" },
      { id: "marketing", labelKey: "whatseek.apps.category.marketing", icon: "\u{1F4E3}" },
      { id: "education", labelKey: "whatseek.apps.category.education", icon: "\u{1F4DA}" },
      { id: "finance", labelKey: "whatseek.apps.category.finance", icon: "\u{1F4B0}" },
      { id: "life", labelKey: "whatseek.apps.category.life", icon: "\u{1F375}" },
      { id: "social", labelKey: "whatseek.apps.category.social", icon: "\u{1F4AC}" },
      { id: "games", labelKey: "whatseek.apps.category.games", icon: "\u{1F3AE}" },
      { id: "enterprise", labelKey: "whatseek.apps.category.enterprise", icon: "\u{1F3E2}" },
      { id: "agent", labelKey: "whatseek.apps.category.agent", icon: "\u{1F916}" }
    ];
    WHATSEEK_CATALOG = [
      {
        id: "clip-master",
        name: "\u526A\u8F91\u5927\u5E08",
        summary: "\u667A\u80FD\u89C6\u9891\u526A\u8F91\uFF1A\u81EA\u52A8\u7C97\u526A\u3001\u5B57\u5E55\u3001\u914D\u4E50\uFF0C\u652F\u6301\u591A\u8F68\u9053\u65F6\u95F4\u7EBF\u3002",
        developer: "\u95EE\u5BFB\u5DE5\u4F5C\u5BA4",
        category: "video",
        kind: "ai",
        icon: "\u{1F3AC}",
        rating: 4.8,
        usersLabel: "2.3\u4E07",
        priceLabel: "\u514D\u8D39",
        aiCapability: true,
        tags: ["\u89C6\u9891\u526A\u8F91", "\u5B57\u5E55", "\u7C97\u526A"],
        updatedAt: "2026-09-28",
        permissions: ["\u76F8\u518C", "\u9EA6\u514B\u98CE"]
      },
      {
        id: "image-studio",
        name: "\u56FE\u7247\u5DE5\u574A",
        summary: "AI \u56FE\u7247\u751F\u6210\u4E0E\u7F16\u8F91\uFF1A\u5546\u54C1\u6D77\u62A5\u3001\u62A0\u56FE\u3001\u6269\u56FE\u4E00\u7AD9\u5B8C\u6210\u3002",
        developer: "\u95EE\u5BFB\u5DE5\u4F5C\u5BA4",
        category: "image",
        kind: "ai",
        icon: "\u{1F5BC}\uFE0F",
        rating: 4.7,
        usersLabel: "1.8\u4E07",
        priceLabel: "\u514D\u8D39",
        aiCapability: true,
        tags: ["\u56FE\u7247\u751F\u6210", "\u6D77\u62A5", "\u62A0\u56FE"],
        updatedAt: "2026-09-25",
        permissions: ["\u76F8\u518C"]
      },
      {
        id: "xhs-title",
        name: "\u5C0F\u7EA2\u4E66\u6807\u9898\u751F\u6210\u5668",
        summary: "\u7206\u6B3E\u6807\u9898\u4E00\u952E\u751F\u6210\uFF1A\u8F93\u5165\u4E3B\u9898\uFF0C\u8F93\u51FA 10 \u6761\u9AD8\u70B9\u51FB\u6807\u9898\u3002",
        developer: "\u521B\u4F5C\u8005\u5C0F\u961F",
        category: "marketing",
        kind: "ai",
        icon: "\u270D\uFE0F",
        rating: 4.6,
        usersLabel: "9562",
        priceLabel: "\u514D\u8D39",
        aiCapability: true,
        tags: ["\u5C0F\u7EA2\u4E66", "\u6807\u9898", "\u6587\u6848"],
        updatedAt: "2026-09-20",
        permissions: []
      },
      {
        id: "crm-manager",
        name: "\u5BA2\u6237\u7BA1\u5BB6 CRM",
        summary: "\u8F7B\u91CF\u5BA2\u6237\u7BA1\u7406\uFF1A\u5BA2\u6237\u5217\u8868\u3001\u8DDF\u8FDB\u8BB0\u5F55\u3001\u6807\u7B7E\u4E0E\u7EDF\u8BA1\u770B\u677F\u3002",
        developer: "\u4E91\u9014\u8F6F\u4EF6",
        category: "enterprise",
        // The enterprise-kind app: visitors get the runner permission-denied
        // state (H5/PC/mini-program/Flutter runner parity).
        kind: "enterprise",
        icon: "\u{1F91D}",
        rating: 4.5,
        usersLabel: "1.1\u4E07",
        priceLabel: "\xA512/\u6708",
        aiCapability: true,
        tags: ["\u5BA2\u6237\u7BA1\u7406", "CRM", "\u9500\u552E"],
        updatedAt: "2026-09-18",
        permissions: ["\u8054\u7CFB\u4EBA"]
      },
      {
        id: "stock-keeper",
        name: "\u5E93\u5B58\u7BA1\u5BB6",
        summary: "\u8FDB\u9500\u5B58\u4E00\u4F53\u5316\uFF1A\u5165\u5E93\u3001\u51FA\u5E93\u3001\u76D8\u70B9\u4E0E\u5E93\u5B58\u9884\u8B66\u3002",
        developer: "\u4E91\u9014\u8F6F\u4EF6",
        category: "enterprise",
        kind: "web",
        icon: "\u{1F4E6}",
        rating: 4.4,
        usersLabel: "7312",
        priceLabel: "\xA58/\u6708",
        aiCapability: false,
        tags: ["\u5E93\u5B58", "\u8FDB\u9500\u5B58", "\u4ED3\u5E93"],
        updatedAt: "2026-09-12",
        permissions: []
      },
      {
        id: "cross-border-picker",
        name: "\u8DE8\u5883\u9009\u54C1\u52A9\u624B",
        summary: "\u8DE8\u5883\u9009\u54C1\u96F7\u8FBE\uFF1A\u8D8B\u52BF\u54C1\u7C7B\u3001\u7ADE\u54C1\u4EF7\u683C\u3001\u5229\u6DA6\u6D4B\u7B97\u3002",
        developer: "\u51FA\u6D77\u5DE5\u5177\u96C6",
        category: "ecommerce",
        kind: "ai",
        icon: "\u{1F6A2}",
        rating: 4.6,
        usersLabel: "1.5\u4E07",
        priceLabel: "\u8BA2\u9605 \xA529/\u6708",
        aiCapability: true,
        tags: ["\u8DE8\u5883", "\u9009\u54C1", "\u7535\u5546"],
        updatedAt: "2026-09-30",
        permissions: []
      },
      {
        id: "site-builder",
        name: "\u72EC\u7ACB\u7AD9\u642D\u5EFA\u5668",
        summary: "30 \u5206\u949F\u642D\u597D\u72EC\u7ACB\u7AD9\uFF1A\u9996\u9875\u3001\u5546\u54C1\u9875\u3001\u8D2D\u7269\u8F66\u3001\u8BA2\u5355\u6A21\u677F\u9F50\u5168\u3002",
        developer: "\u51FA\u6D77\u5DE5\u5177\u96C6",
        category: "ecommerce",
        kind: "web",
        icon: "\u{1F3D7}\uFE0F",
        rating: 4.3,
        usersLabel: "6891",
        priceLabel: "\u514D\u8D39",
        aiCapability: true,
        tags: ["\u72EC\u7ACB\u7AD9", "\u5EFA\u7AD9", "\u7535\u5546"],
        updatedAt: "2026-09-08",
        permissions: []
      },
      {
        id: "meeting-notes",
        name: "\u4F1A\u8BAE\u7EAA\u8981\u52A9\u624B",
        summary: "\u5F55\u97F3\u8F6C\u7EAA\u8981\uFF1A\u81EA\u52A8\u533A\u5206\u53D1\u8A00\u4EBA\uFF0C\u8F93\u51FA\u5F85\u529E\u6E05\u5355\u3002",
        developer: "\u6548\u7387\u5F15\u64CE",
        category: "office",
        kind: "ai",
        icon: "\u{1F4DD}",
        rating: 4.7,
        usersLabel: "3.4\u4E07",
        priceLabel: "\u514D\u8D39",
        aiCapability: true,
        tags: ["\u4F1A\u8BAE", "\u7EAA\u8981", "\u8F6C\u5199"],
        updatedAt: "2026-09-29",
        permissions: ["\u9EA6\u514B\u98CE", "\u6587\u4EF6"]
      },
      {
        id: "code-mate",
        name: "\u4EE3\u7801\u52A9\u624B",
        summary: "AI \u7ED3\u5BF9\u7F16\u7A0B\uFF1A\u8865\u5168\u3001\u89E3\u91CA\u3001\u91CD\u6784\u3001\u5355\u6D4B\u751F\u6210\u3002",
        developer: "BirdCoder",
        category: "coding",
        kind: "ai",
        icon: "\u{1F4BB}",
        rating: 4.9,
        usersLabel: "5.6\u4E07",
        priceLabel: "\u8BA2\u9605 \xA520/\u6708",
        aiCapability: true,
        tags: ["\u7F16\u7A0B", "AI", "\u5355\u6D4B"],
        updatedAt: "2026-10-01",
        permissions: ["\u6587\u4EF6"]
      },
      {
        id: "audio-scribe",
        name: "\u97F3\u9891\u8F6C\u5199",
        summary: "\u97F3\u9891\u8F6C\u6587\u5B57\uFF1A\u4E2D\u82F1\u6DF7\u5408\u8BC6\u522B\uFF0C\u652F\u6301\u5BFC\u51FA SRT \u5B57\u5E55\u3002",
        developer: "\u6548\u7387\u5F15\u64CE",
        category: "audio",
        kind: "ai",
        icon: "\u{1F3A7}",
        rating: 4.5,
        usersLabel: "1.2\u4E07",
        priceLabel: "\u514D\u8D39",
        aiCapability: true,
        tags: ["\u8F6C\u5199", "\u5B57\u5E55", "\u97F3\u9891"],
        updatedAt: "2026-09-15",
        permissions: ["\u9EA6\u514B\u98CE", "\u6587\u4EF6"]
      },
      {
        id: "ledger-lite",
        name: "\u8F7B\u8BB0\u8D26",
        summary: "\u6781\u7B80\u8BB0\u8D26\uFF1A\u62CD\u7167\u8BB0\u4E00\u7B14\uFF0C\u81EA\u52A8\u5206\u7C7B\u6708\u5EA6\u62A5\u8868\u3002",
        developer: "\u751F\u6D3B\u5C0F\u961F",
        category: "finance",
        kind: "mini",
        icon: "\u{1F4B0}",
        rating: 4.4,
        usersLabel: "2.9\u4E07",
        priceLabel: "\u514D\u8D39",
        aiCapability: true,
        tags: ["\u8BB0\u8D26", "\u8D22\u52A1", "\u62A5\u8868"],
        updatedAt: "2026-09-10",
        permissions: ["\u76F8\u518C"]
      },
      {
        id: "schedule-pro",
        name: "\u65E5\u7A0B\u7BA1\u5BB6",
        summary: "\u65E5\u7A0B\u7BA1\u7406\uFF1A\u81EA\u7136\u8BED\u8A00\u5EFA\u65E5\u7A0B\uFF0C\u591A\u7AEF\u63D0\u9192\u4E0D\u9057\u6F0F\u3002",
        developer: "\u6548\u7387\u5F15\u64CE",
        category: "efficiency",
        kind: "web",
        icon: "\u{1F4C5}",
        rating: 4.6,
        usersLabel: "2.1\u4E07",
        priceLabel: "\u514D\u8D39",
        aiCapability: true,
        tags: ["\u65E5\u7A0B", "\u63D0\u9192", "\u6548\u7387"],
        updatedAt: "2026-09-22",
        permissions: ["\u901A\u77E5"]
      },
      {
        id: "study-notes",
        name: "\u5B66\u4E60\u7B14\u8BB0",
        summary: "AI \u5B66\u4E60\u7B14\u8BB0\uFF1A\u5212\u7EBF\u6458\u5F55\u81EA\u52A8\u6574\u7406\u6210\u77E5\u8BC6\u5361\u7247\u3002",
        developer: "\u6559\u80B2\u5B9E\u9A8C\u5BA4",
        category: "education",
        kind: "ai",
        icon: "\u{1F4DA}",
        rating: 4.5,
        usersLabel: "8734",
        priceLabel: "\u514D\u8D39",
        aiCapability: true,
        tags: ["\u7B14\u8BB0", "\u5B66\u4E60", "\u77E5\u8BC6\u5361"],
        updatedAt: "2026-09-05",
        permissions: []
      },
      {
        id: "city-bites",
        name: "\u9644\u8FD1\u63A2\u5E97",
        summary: "\u53D1\u73B0\u9644\u8FD1\u597D\u5E97\uFF1A\u771F\u5B9E\u8BC4\u4EF7\u3001\u4EBA\u5747\u4E0E\u6392\u961F\u60C5\u51B5\u3002",
        developer: "\u751F\u6D3B\u5C0F\u961F",
        category: "life",
        kind: "external",
        icon: "\u{1F375}",
        rating: 4.2,
        usersLabel: "4.7\u4E07",
        priceLabel: "\u514D\u8D39",
        aiCapability: false,
        tags: ["\u63A2\u5E97", "\u7F8E\u98DF", "\u9644\u8FD1"],
        updatedAt: "2026-08-30",
        permissions: ["\u5730\u7406\u4F4D\u7F6E"]
      },
      {
        id: "interest-clubs",
        name: "\u5174\u8DA3\u793E\u7FA4",
        summary: "\u627E\u5230\u540C\u597D\uFF1A\u8BFB\u4E66\u4F1A\u3001\u722C\u5C71\u961F\u3001\u684C\u6E38\u5C40\uFF0C\u4E00\u952E\u52A0\u5165\u3002",
        developer: "\u793E\u7FA4\u79D1\u6280",
        category: "social",
        kind: "web",
        icon: "\u{1F4AC}",
        rating: 4.1,
        usersLabel: "1.9\u4E07",
        priceLabel: "\u514D\u8D39",
        aiCapability: false,
        tags: ["\u793E\u7FA4", "\u5174\u8DA3", "\u6D3B\u52A8"],
        updatedAt: "2026-08-26",
        permissions: ["\u901A\u77E5"]
      },
      {
        id: "game-center",
        name: "\u68CB\u724C\u6E38\u620F\u4E2D\u5FC3",
        summary: "\u6597\u5730\u4E3B\u3001\u9EBB\u5C06\u3001\u8C61\u68CB\uFF0C\u968F\u65F6\u5F00\u5C40\u3002",
        developer: "\u6E38\u620F\u5DE5\u574A",
        category: "games",
        kind: "web",
        icon: "\u{1F3AE}",
        rating: 4,
        usersLabel: "6.8\u4E07",
        priceLabel: "\u514D\u8D39",
        aiCapability: false,
        tags: ["\u68CB\u724C", "\u6E38\u620F", "\u4F11\u95F2"],
        updatedAt: "2026-09-01",
        permissions: []
      },
      {
        id: "contract-review",
        name: "\u5408\u540C\u5BA1\u67E5\u52A9\u624B",
        summary: "AI \u5408\u540C\u5BA1\u67E5\uFF1A\u98CE\u9669\u6761\u6B3E\u6807\u6CE8\u3001\u7F3A\u5931\u6761\u6B3E\u63D0\u793A\u3002",
        developer: "\u4F01\u4E1A\u670D\u52A1\u793E",
        category: "enterprise",
        kind: "ai",
        icon: "\u{1F4DC}",
        rating: 4.7,
        usersLabel: "5120",
        priceLabel: "\u4F01\u4E1A\u6388\u6743",
        aiCapability: true,
        tags: ["\u5408\u540C", "\u6CD5\u52A1", "\u5BA1\u67E5"],
        updatedAt: "2026-09-26",
        permissions: ["\u6587\u4EF6"]
      },
      {
        id: "data-board",
        name: "\u6570\u636E\u770B\u677F",
        summary: "\u4E1A\u52A1\u6570\u636E\u4E00\u5C4F\u638C\u63E1\uFF1A\u6307\u6807\u5361\u3001\u8D8B\u52BF\u56FE\u3001\u5F02\u5E38\u63D0\u9192\u3002",
        developer: "\u4E91\u9014\u8F6F\u4EF6",
        category: "office",
        kind: "web",
        icon: "\u{1F4CA}",
        rating: 4.5,
        usersLabel: "1.6\u4E07",
        priceLabel: "\xA515/\u6708",
        aiCapability: true,
        tags: ["\u6570\u636E", "\u770B\u677F", "\u7EDF\u8BA1"],
        updatedAt: "2026-09-24",
        permissions: []
      },
      {
        id: "news-agent",
        name: "\u884C\u4E1A\u65B0\u95FB\u6574\u7406 Agent",
        summary: "\u6BCF\u5929\u5B9A\u65F6\u6574\u7406\u884C\u4E1A\u65B0\u95FB\u6458\u8981\uFF0C\u63A8\u9001\u5230\u6D88\u606F\u4E2D\u5FC3\u3002",
        developer: "\u95EE\u5BFB\u5B98\u65B9",
        category: "agent",
        kind: "agent",
        icon: "\u{1F916}",
        rating: 4.8,
        usersLabel: "9863",
        priceLabel: "\u514D\u8D39",
        aiCapability: true,
        tags: ["Agent", "\u65B0\u95FB", "\u5B9A\u65F6\u4EFB\u52A1"],
        updatedAt: "2026-09-27",
        permissions: ["\u901A\u77E5"]
      }
    ];
    CREATION_MODULE_PLANS = [
      { match: ["\u5E93\u5B58", "\u8FDB\u9500\u5B58", "\u4ED3\u5E93"], modules: ["\u5546\u54C1\u5165\u5E93", "\u51FA\u5E93\u7BA1\u7406", "\u5E93\u5B58\u76D8\u70B9", "\u5E93\u5B58\u9884\u8B66", "\u5E93\u5B58\u7EDF\u8BA1"] },
      { match: ["\u5BA2\u6237", "crm", "\u9500\u552E"], modules: ["\u5BA2\u6237\u5217\u8868", "\u5BA2\u6237\u8BE6\u60C5", "\u8DDF\u8FDB\u8BB0\u5F55", "\u6807\u7B7E", "\u641C\u7D22", "\u6570\u636E\u7EDF\u8BA1"] },
      { match: ["\u72EC\u7ACB\u7AD9", "\u5546\u57CE", "\u5356", "\u7535\u5546", "\u5E97\u94FA"], modules: ["\u9996\u9875", "\u5546\u54C1\u9875", "\u8D2D\u7269\u8F66", "\u8BA2\u5355", "\u5BA2\u6237\u7BA1\u7406", "\u8425\u9500\u9875\u9762"] },
      { match: ["\u8BA2\u5355", "order"], modules: ["\u8BA2\u5355\u5217\u8868", "\u8BA2\u5355\u8BE6\u60C5", "\u53D1\u8D27\u7BA1\u7406", "\u552E\u540E"] },
      { match: ["\u4F1A\u5458", "member"], modules: ["\u4F1A\u5458\u7B49\u7EA7", "\u6743\u76CA\u7BA1\u7406", "\u79EF\u5206\u89C4\u5219"] },
      { match: ["\u652F\u4ED8", "pay"], modules: ["\u6536\u94F6\u53F0", "\u652F\u4ED8\u6E20\u9053", "\u5BF9\u8D26"] },
      { match: ["\u5F85\u529E", "\u4EFB\u52A1", "todo"], modules: ["\u4EFB\u52A1\u5217\u8868", "\u4EFB\u52A1\u8BE6\u60C5", "\u63D0\u9192"] },
      { match: ["\u7B14\u8BB0", "notes", "\u77E5\u8BC6"], modules: ["\u7B14\u8BB0\u5217\u8868", "\u7F16\u8F91\u5668", "\u6807\u7B7E", "\u641C\u7D22"] }
    ];
    DEFAULT_CREATION_MODULES = ["\u9996\u9875", "\u5217\u8868", "\u8BE6\u60C5", "\u8BBE\u7F6E", "\u6570\u636E\u7EDF\u8BA1"];
  }
});

// ../sdkwork-whatseek-common/packages/sdkwork-whatseek-service-core/src/apps/search.ts
function extractSearchKeywords(query) {
  const normalized = query.toLowerCase().trim();
  if (normalized.length === 0) {
    return [];
  }
  const segments = normalized.split(/[\s,，。.、;；!！?？/\\]+/u).map((segment) => segment.trim()).filter((segment) => segment.length > 0);
  const keywords = [];
  for (const segment of segments) {
    let remaining = segment;
    for (const stopword of STOPWORDS) {
      remaining = remaining.split(stopword).join(" ");
    }
    for (const token of remaining.split(/\s+/u)) {
      if (token.length > 0 && !keywords.includes(token)) {
        keywords.push(token);
      }
    }
  }
  return keywords;
}
function scoreAppForKeywords(app, keywords) {
  let score = 0;
  let matchedOn = "";
  const name = app.name.toLowerCase();
  const summary = app.summary.toLowerCase();
  const category = app.category.toLowerCase();
  for (const keyword of keywords) {
    if (name.includes(keyword)) {
      score += 6;
      matchedOn = matchedOn.length === 0 ? keyword : matchedOn;
    }
    for (const tag of app.tags) {
      const lowerTag = tag.toLowerCase();
      if (lowerTag.includes(keyword) || keyword.includes(lowerTag)) {
        score += 4;
        if (matchedOn.length === 0) {
          matchedOn = tag;
        }
      }
    }
    if (summary.includes(keyword)) {
      score += 2;
      if (matchedOn.length === 0) {
        matchedOn = keyword;
      }
    }
    if (category.includes(keyword)) {
      score += 2;
      if (matchedOn.length === 0) {
        matchedOn = keyword;
      }
    }
  }
  return score > 0 ? { app, score, matchedOn } : null;
}
var STOPWORDS;
var init_search = __esm({
  "../sdkwork-whatseek-common/packages/sdkwork-whatseek-service-core/src/apps/search.ts"() {
    "use strict";
    init_define_SDKWORK_RUNTIME_ENV();
    STOPWORDS = [
      "\u5E2E\u6211",
      "\u627E\u4E00\u4E2A",
      "\u627E\u4E00\u4E0B",
      "\u627E\u4E00\u4E2A",
      "\u60F3\u8981",
      "\u9700\u8981",
      "\u6709\u6CA1\u6709",
      "\u63A8\u8350",
      "\u9002\u5408",
      "\u652F\u6301",
      "\u53EF\u4EE5",
      "\u4E00\u4E2A",
      "\u4E00\u6B3E",
      "\u5DE5\u5177",
      "\u8F6F\u4EF6",
      "\u5E94\u7528",
      "\u7684",
      "\u4E86",
      "\u5417",
      "\u5462",
      "\u548C",
      "\u8DDF",
      "\u4E0E",
      "\u8FD8\u6709",
      "please",
      "find",
      "search",
      "look",
      "for",
      "want",
      "need",
      "recommend",
      "suitable",
      "tool",
      "software",
      "application",
      "app",
      "a",
      "an",
      "the",
      "me",
      "my",
      "with",
      "that"
    ];
  }
});

// ../sdkwork-whatseek-common/packages/sdkwork-whatseek-service-core/src/apps/appsClient.ts
function defaultStorage() {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}
function readJsonList(storage, key) {
  if (storage === null) {
    return [];
  }
  try {
    const raw = storage.getItem(key);
    if (raw === null) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
function writeJsonList(storage, key, value) {
  if (storage === null) {
    return;
  }
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
  }
}
function createMockAppsClient(options = {}) {
  const storage = options.storage === void 0 ? defaultStorage() : options.storage;
  const now = options.now ?? (() => /* @__PURE__ */ new Date());
  let createdApps = readJsonList(storage, CREATED_APPS_KEY);
  let recentIds = readJsonList(storage, RECENT_KEY);
  let favoriteIds = readJsonList(storage, FAVORITES_KEY);
  const findCatalogApp = (appId) => WHATSEEK_CATALOG.find((app) => app.id === appId) ?? null;
  const persist = () => {
    writeJsonList(storage, CREATED_APPS_KEY, createdApps);
    writeJsonList(storage, RECENT_KEY, recentIds);
    writeJsonList(storage, FAVORITES_KEY, favoriteIds);
  };
  const appsByIds = (ids) => ids.map((id) => findCatalogApp(id) ?? toCatalogShape(createdApps.find((app) => app.id === id))).filter((app) => app !== null);
  return {
    async searchApps(query) {
      const keywords = extractSearchKeywords(query);
      if (keywords.length === 0) {
        return [];
      }
      const scored = WHATSEEK_CATALOG.map((app) => scoreAppForKeywords(app, keywords)).filter((entry) => entry !== null).sort((left, right) => right.score - left.score);
      const recommendations = scored.map(({ app, matchedOn }) => ({
        app,
        reason: matchedOn.length > 0 ? matchedOn : app.category
      }));
      return recommendations;
    },
    async listRecommended() {
      return [...WHATSEEK_CATALOG].filter((app) => app.aiCapability).slice(0, 6);
    },
    async listHot() {
      return [...WHATSEEK_CATALOG].slice(0, 8);
    },
    async listCategories() {
      return [...WHATSEEK_CATEGORIES];
    },
    async listByCategory(categoryId) {
      return WHATSEEK_CATALOG.filter((app) => app.category === categoryId);
    },
    async getApp(appId) {
      return findCatalogApp(appId) ?? toCatalogShape(createdApps.find((app) => app.id === appId));
    },
    async listRecent() {
      return appsByIds(recentIds).slice(0, 8);
    },
    async recordRecent(appId) {
      recentIds = [appId, ...recentIds.filter((id) => id !== appId)].slice(0, 20);
      persist();
    },
    async listFavorites() {
      return appsByIds(favoriteIds);
    },
    async toggleFavorite(appId) {
      if (favoriteIds.includes(appId)) {
        favoriteIds = favoriteIds.filter((id) => id !== appId);
        persist();
        return false;
      }
      favoriteIds = [appId, ...favoriteIds];
      persist();
      return true;
    },
    async listMyApps() {
      return [...createdApps].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
    },
    async getMyApp(appId) {
      return createdApps.find((app) => app.id === appId) ?? null;
    },
    async deleteMyApp(appId) {
      createdApps = createdApps.filter((app) => app.id !== appId);
      persist();
    },
    draftCreationPlan(requirement) {
      const trimmed = requirement.trim();
      const title = trimmed.length > 0 ? trimmed : "\u65B0\u5E94\u7528";
      return { title: `\u300C${title}\u300D\u751F\u6210\u65B9\u6848`, modules: planModulesForRequirement(trimmed) };
    },
    async createAppFromPlan(requirement, modules) {
      const stamp = now();
      const id = `gen-${stamp.getTime().toString(36)}-${Math.floor(Math.random() * 1e4).toString(36)}`;
      const created = {
        id,
        name: deriveAppName(requirement),
        requirement: requirement.trim(),
        modules: [...modules],
        lifecycle: "preview",
        createdAt: stamp.toISOString(),
        updatedAt: stamp.toISOString(),
        versions: ["0.1.0"],
        icon: "\u{1F9E9}"
      };
      createdApps = [created, ...createdApps];
      persist();
      return created;
    },
    async modifyApp(appId, instruction) {
      const existing = createdApps.find((app) => app.id === appId);
      if (existing === void 0) {
        throw new Error(`created app not found: ${appId}`);
      }
      const nextVersion = bumpVersion(existing.versions[existing.versions.length - 1] ?? "0.1.0");
      const updated = {
        ...existing,
        modules: appendInstructionModule(existing.modules, instruction),
        lifecycle: existing.lifecycle === "published" ? "updated" : existing.lifecycle,
        versions: [...existing.versions, nextVersion],
        updatedAt: now().toISOString()
      };
      createdApps = createdApps.map((app) => app.id === appId ? updated : app);
      persist();
      return updated;
    },
    async publishApp(appId) {
      const existing = createdApps.find((app) => app.id === appId);
      if (existing === void 0) {
        throw new Error(`created app not found: ${appId}`);
      }
      const published = {
        ...existing,
        lifecycle: "published",
        updatedAt: now().toISOString()
      };
      createdApps = createdApps.map((app) => app.id === appId ? published : app);
      persist();
      return published;
    }
  };
}
function deriveAppName(requirement) {
  const trimmed = requirement.trim();
  if (trimmed.length === 0) {
    return "\u672A\u547D\u540D\u5E94\u7528";
  }
  const stripped = trimmed.replace(/^帮我/gu, "").replace(/(创建|做一个|做|生成|开发|搭建|制作)/gu, "").replace(/[。.,!！?？\s]+$/gu, "").trim();
  const candidate = stripped.length > 0 ? stripped : trimmed;
  return candidate.length > 12 ? `${candidate.slice(0, 12)}\u2026` : candidate;
}
function appendInstructionModule(modules, instruction) {
  const normalized = instruction.trim();
  if (normalized.length === 0) {
    return [...modules];
  }
  const addition = normalized.length > 8 ? `${normalized.slice(0, 8)}\u2026` : normalized;
  return modules.includes(addition) ? [...modules] : [...modules, addition];
}
function bumpVersion(version) {
  const [major = "0", minor = "0", patch = "0"] = version.split(".");
  return `${major}.${minor}.${Number.parseInt(patch, 10) + 1}`;
}
function toCatalogShape(created) {
  if (created === void 0) {
    return null;
  }
  return {
    id: created.id,
    name: created.name,
    summary: created.requirement,
    developer: "\u6211",
    category: "generated",
    kind: "generated",
    icon: created.icon,
    rating: 5,
    usersLabel: "1",
    priceLabel: "\u514D\u8D39",
    aiCapability: true,
    tags: created.modules.slice(0, 3),
    updatedAt: created.updatedAt.slice(0, 10),
    permissions: []
  };
}
var CREATED_APPS_KEY, RECENT_KEY, FAVORITES_KEY;
var init_appsClient = __esm({
  "../sdkwork-whatseek-common/packages/sdkwork-whatseek-service-core/src/apps/appsClient.ts"() {
    "use strict";
    init_define_SDKWORK_RUNTIME_ENV();
    init_catalog();
    init_search();
    CREATED_APPS_KEY = "whatseek.created-apps";
    RECENT_KEY = "whatseek.recent-apps";
    FAVORITES_KEY = "whatseek.favorite-apps";
  }
});

// ../sdkwork-whatseek-common/packages/sdkwork-whatseek-service-core/src/contacts/contactsClient.ts
function createMockContactsClient(options = {}) {
  const contacts = options.seed ?? SEED_CONTACTS;
  const matches = (contact, query) => {
    const lower = query.toLowerCase();
    return contact.name.toLowerCase().includes(lower) || contact.bio.toLowerCase().includes(lower) || contact.tags.some((tag) => tag.toLowerCase().includes(lower)) || contact.company !== void 0 && contact.company.toLowerCase().includes(lower);
  };
  return {
    async listContacts() {
      return [...contacts];
    },
    async searchContacts(query) {
      const trimmed = query.trim();
      if (trimmed.length === 0) {
        return [...contacts];
      }
      return contacts.filter((contact) => matches(contact, trimmed));
    },
    async getContact(contactId) {
      return contacts.find((contact) => contact.id === contactId) ?? null;
    }
  };
}
var SEED_CONTACTS;
var init_contactsClient = __esm({
  "../sdkwork-whatseek-common/packages/sdkwork-whatseek-service-core/src/contacts/contactsClient.ts"() {
    "use strict";
    init_define_SDKWORK_RUNTIME_ENV();
    SEED_CONTACTS = [
      { id: "zhangsan", name: "\u5F20\u4E09", kind: "person", bio: "\u4EA7\u54C1\u7ECF\u7406 \xB7 \u8D1F\u8D23\u95EE\u5BFB\u5E94\u7528\u4E2D\u5FC3", tags: ["\u540C\u4E8B", "\u4EA7\u54C1"], company: "\u95EE\u5BFB", avatar: "\u{1F9D1}\u200D\u{1F4BC}" },
      { id: "lisi", name: "\u674E\u56DB", kind: "person", bio: "\u524D\u7AEF\u5DE5\u7A0B\u5E08 \xB7 H5 \u6E32\u67D3\u5C42", tags: ["\u540C\u4E8B", "\u524D\u7AEF"], company: "\u95EE\u5BFB", avatar: "\u{1F469}\u200D\u{1F4BB}" },
      { id: "wangwu", name: "\u738B\u4E94", kind: "person", bio: "\u91C7\u8D2D\u8D1F\u8D23\u4EBA \xB7 \u534E\u4E1C\u533A", tags: ["\u5408\u4F5C", "\u91C7\u8D2D"], company: "\u51FA\u6D77\u4F18\u9009", avatar: "\u{1F9D1}\u200D\u{1F33E}" },
      { id: "design-team", name: "\u8BBE\u8BA1\u56E2\u961F", kind: "group", bio: "\u95EE\u5BFB\u8BBE\u8BA1\u90E8 \xB7 \u89C6\u89C9\u4E0E\u4F53\u9A8C", tags: ["\u7FA4\u7EC4", "\u8BBE\u8BA1"], avatar: "\u{1F3A8}" },
      { id: "prod-team", name: "\u4EA7\u54C1\u4EA4\u6D41\u7FA4", kind: "group", bio: "AI \u4EA7\u54C1\u7ECF\u7406\u4EA4\u6D41\u7FA4", tags: ["\u7FA4\u7EC4", "\u4EA7\u54C1"], avatar: "\u{1F465}" },
      { id: "supplier-jinshang", name: "\u4E0A\u6D77\u9526\u88F3\u670D\u9970", kind: "org", bio: "T \u6064/\u536B\u8863\u5B9A\u5236\u4F9B\u5E94\u5546 \xB7 7 \u5929\u6253\u6837", tags: ["\u4F9B\u5E94\u5546", "\u670D\u9970"], company: "\u4E0A\u6D77\u9526\u88F3\u670D\u9970\u6709\u9650\u516C\u53F8", avatar: "\u{1F3ED}" },
      { id: "supplier-haohan", name: "\u4E49\u4E4C\u7693\u701A\u670D\u9970", kind: "org", bio: "\u73B0\u8D27\u6DF7\u6279 \xB7 \u4E00\u4EF6\u4EE3\u53D1", tags: ["\u4F9B\u5E94\u5546", "\u73B0\u8D27"], company: "\u4E49\u4E4C\u5E02\u7693\u701A\u670D\u9970\u6709\u9650\u516C\u53F8", avatar: "\u{1F3EC}" },
      { id: "service-shoot", name: "\u5149\u5F71\u6444\u5F71\u670D\u52A1", kind: "org", bio: "\u5546\u54C1\u62CD\u6444 \xB7 \u767D\u5E95\u56FE 48h \u4EA4\u4ED8", tags: ["\u670D\u52A1\u5546", "\u6444\u5F71"], company: "\u5149\u5F71\u6587\u5316\u4F20\u5A92", avatar: "\u{1F4F7}" },
      { id: "agent-news", name: "\u884C\u4E1A\u65B0\u95FB\u6574\u7406 Agent", kind: "agent", bio: "\u6BCF\u5929 9:00 \u6574\u7406\u884C\u4E1A\u65B0\u95FB\u6458\u8981", tags: ["Agent", "\u65B0\u95FB"], avatar: "\u{1F916}" },
      { id: "agent-selection", name: "\u8DE8\u5883\u9009\u54C1 Agent", kind: "agent", bio: "\u76D1\u63A7\u9009\u54C1\u96F7\u8FBE\u5E76\u63A8\u9001\u673A\u4F1A", tags: ["Agent", "\u7535\u5546"], avatar: "\u{1F6F0}\uFE0F" },
      { id: "whatseek-ai", name: "\u95EE\u5BFB AI \u52A9\u624B", kind: "assistant", bio: "\u4F60\u8D1F\u8D23\u95EE\uFF0CAI \u8D1F\u8D23\u5BFB", tags: ["AI", "\u5B98\u65B9"], avatar: "\u2728" }
    ];
  }
});

// ../sdkwork-whatseek-common/packages/sdkwork-whatseek-service-core/src/messages/messagesClient.ts
function defaultStorage2() {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}
function seedState(nowIso) {
  const conversations = [
    { id: "conv-zhangsan", kind: "direct", title: "\u5F20\u4E09", contactId: "zhangsan", unread: 1, updatedAt: nowIso, lastMessagePreview: "\u4E0B\u5348\u4E09\u70B9\u5F00\u4F1A\u8BB0\u5F97\u53C2\u52A0\u3002" },
    { id: "conv-design", kind: "group", title: "\u8BBE\u8BA1\u56E2\u961F", contactId: "design-team", unread: 0, updatedAt: nowIso, lastMessagePreview: "\u65B0\u9996\u9875\u65B9\u6848\u5DF2\u4E0A\u4F20\u3002" },
    { id: "conv-agent-news", kind: "agent", title: "\u884C\u4E1A\u65B0\u95FB\u6574\u7406 Agent", contactId: "agent-news", unread: 2, updatedAt: nowIso, lastMessagePreview: "\u4ECA\u65E5\u884C\u4E1A\u65B0\u95FB\u6458\u8981\u5DF2\u751F\u6210\u3002" },
    { id: "conv-supplier", kind: "direct", title: "\u4E0A\u6D77\u9526\u88F3\u670D\u9970", contactId: "supplier-jinshang", unread: 0, updatedAt: nowIso, lastMessagePreview: "\u6837\u54C1\u5DF2\u5BC4\u51FA\uFF0C\u8BF7\u6CE8\u610F\u67E5\u6536\u3002" },
    { id: "conv-system", kind: "system", titleKey: "whatseek.messages.kind.system", unread: 0, updatedAt: nowIso, lastMessagePreview: "\u6B22\u8FCE\u6765\u5230\u95EE\u5BFB\u3002" },
    { id: "conv-task-video", kind: "task", titleKey: "whatseek.messages.kind.task", taskId: "task-demo-video", unread: 1, updatedAt: nowIso, lastMessagePreview: "\u4F60\u8981\u6C42\u7684\u89C6\u9891\u5DF2\u7ECF\u751F\u6210\u3002" }
  ];
  const messages = {
    "conv-zhangsan": [
      { id: "m-1", conversationId: "conv-zhangsan", senderId: "zhangsan", senderName: "\u5F20\u4E09", content: "\u4E0B\u5348\u4E09\u70B9\u5F00\u4F1A\u8BB0\u5F97\u53C2\u52A0\u3002", sentAt: nowIso, kind: "text" }
    ],
    "conv-design": [
      { id: "m-2", conversationId: "conv-design", senderId: "design-team", senderName: "\u8BBE\u8BA1\u56E2\u961F", content: "\u65B0\u9996\u9875\u65B9\u6848\u5DF2\u4E0A\u4F20\u3002", sentAt: nowIso, kind: "text" }
    ],
    "conv-agent-news": [
      { id: "m-3", conversationId: "conv-agent-news", senderId: "agent-news", senderName: "\u884C\u4E1A\u65B0\u95FB\u6574\u7406 Agent", content: "\u4ECA\u65E5\u884C\u4E1A\u65B0\u95FB\u6458\u8981\u5DF2\u751F\u6210\u3002", sentAt: nowIso, kind: "text" },
      { id: "m-4", conversationId: "conv-agent-news", senderId: "agent-news", senderName: "\u884C\u4E1A\u65B0\u95FB\u6574\u7406 Agent", content: "AI Coding \u5468\u62A5\u5DF2\u66F4\u65B0\u3002", sentAt: nowIso, kind: "text" }
    ],
    "conv-supplier": [
      { id: "m-5", conversationId: "conv-supplier", senderId: "supplier-jinshang", senderName: "\u4E0A\u6D77\u9526\u88F3\u670D\u9970", content: "\u6837\u54C1\u5DF2\u5BC4\u51FA\uFF0C\u8BF7\u6CE8\u610F\u67E5\u6536\u3002", sentAt: nowIso, kind: "text" }
    ],
    "conv-system": [
      { id: "m-6", conversationId: "conv-system", senderId: "system", senderName: "\u95EE\u5BFB", content: "\u6B22\u8FCE\u6765\u5230\u95EE\u5BFB\u3002", sentAt: nowIso, kind: "system" }
    ],
    "conv-task-video": [
      { id: "m-7", conversationId: "conv-task-video", senderId: "task", senderName: "\u95EE\u5BFB AI", content: "\u4F60\u8981\u6C42\u7684\u89C6\u9891\u5DF2\u7ECF\u751F\u6210\u3002", sentAt: nowIso, kind: "task" }
    ]
  };
  return { conversations, messages };
}
function createMockMessagesClient(options = {}) {
  const storage = options.storage === void 0 ? defaultStorage2() : options.storage;
  const now = options.now ?? (() => /* @__PURE__ */ new Date());
  const autoReplyMs = options.autoReplyMs ?? 800;
  let state;
  if (storage !== null) {
    try {
      const raw = storage.getItem(STATE_KEY);
      const parsed = raw === null ? null : JSON.parse(raw);
      state = parsed !== null && typeof parsed === "object" && Array.isArray(parsed.conversations) ? parsed : seedState(now().toISOString());
    } catch {
      state = seedState(now().toISOString());
    }
  } else {
    state = seedState(now().toISOString());
  }
  const persist = () => {
    if (storage !== null) {
      try {
        storage.setItem(STATE_KEY, JSON.stringify(state));
      } catch {
      }
    }
  };
  const touch = (conversationId, preview) => {
    state.conversations = state.conversations.map(
      (conversation) => conversation.id === conversationId ? { ...conversation, updatedAt: now().toISOString(), lastMessagePreview: preview } : conversation
    );
  };
  return {
    async listConversations() {
      return [...state.conversations].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
    },
    async listMessages(conversationId) {
      return [...state.messages[conversationId] ?? []];
    },
    async sendMessage(conversationId, content) {
      const conversation = state.conversations.find((entry) => entry.id === conversationId);
      if (conversation === void 0) {
        throw new Error(`conversation not found: ${conversationId}`);
      }
      const stamp = now();
      const message = {
        id: `m-${stamp.getTime().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`,
        conversationId,
        senderId: "me",
        senderName: "\u6211",
        content,
        sentAt: stamp.toISOString(),
        kind: "text"
      };
      state.messages[conversationId] = [...state.messages[conversationId] ?? [], message];
      touch(conversationId, content);
      persist();
      const contactId = conversation.contactId;
      if (contactId !== void 0 && (conversation.kind === "direct" || conversation.kind === "agent")) {
        const replyContent = conversation.kind === "agent" ? "\u6536\u5230\uFF0C\u6211\u5DF2\u5F00\u59CB\u5904\u7406\u8FD9\u4E2A\u8BF7\u6C42\u3002" : "\u597D\u7684\uFF0C\u6536\u5230\uFF01";
        globalThis.setTimeout?.(() => {
          const reply = {
            id: `m-${Date.now().toString(36)}-reply`,
            conversationId,
            senderId: contactId,
            senderName: conversation.title ?? "\u5BF9\u65B9",
            content: replyContent,
            sentAt: (/* @__PURE__ */ new Date()).toISOString(),
            kind: "text"
          };
          state.messages[conversationId] = [...state.messages[conversationId] ?? [], reply];
          touch(conversationId, replyContent);
          persist();
        }, autoReplyMs);
      }
      return message;
    },
    async markRead(conversationId) {
      state.conversations = state.conversations.map(
        (conversation) => conversation.id === conversationId ? { ...conversation, unread: 0 } : conversation
      );
      persist();
    },
    async openDirectConversation(contactId) {
      const existing = state.conversations.find(
        (conversation) => conversation.kind === "direct" && conversation.contactId === contactId
      );
      if (existing !== void 0) {
        return existing;
      }
      const created = {
        id: `conv-${contactId}`,
        kind: "direct",
        title: contactId,
        contactId,
        unread: 0,
        updatedAt: now().toISOString()
      };
      state.conversations = [created, ...state.conversations];
      state.messages[created.id] = [];
      persist();
      return created;
    },
    async postTaskNotification(task) {
      const conversationId = `conv-task-${task.id}`;
      const existing = state.conversations.find((conversation) => conversation.id === conversationId);
      const content = task.resultSummary ?? task.title;
      const message = {
        id: `m-${task.id}`,
        conversationId,
        senderId: "task",
        senderName: "\u95EE\u5BFB AI",
        content: `\u300C${content}\u300D\u5DF2\u5B8C\u6210\u3002`,
        sentAt: now().toISOString(),
        kind: "task"
      };
      if (existing === void 0) {
        const conversation = {
          id: conversationId,
          kind: "task",
          titleKey: "whatseek.messages.kind.task",
          taskId: task.id,
          unread: 1,
          updatedAt: message.sentAt,
          lastMessagePreview: message.content
        };
        state.conversations = [conversation, ...state.conversations];
        state.messages[conversationId] = [message];
      } else {
        state.messages[conversationId] = [...state.messages[conversationId] ?? [], message];
        touch(conversationId, message.content);
      }
      persist();
    },
    async getUnreadTotal() {
      return state.conversations.reduce((total, conversation) => total + conversation.unread, 0);
    }
  };
}
var STATE_KEY;
var init_messagesClient = __esm({
  "../sdkwork-whatseek-common/packages/sdkwork-whatseek-service-core/src/messages/messagesClient.ts"() {
    "use strict";
    init_define_SDKWORK_RUNTIME_ENV();
    STATE_KEY = "whatseek.messages-state";
  }
});

// ../sdkwork-whatseek-common/packages/sdkwork-whatseek-intent-core/src/recognizer.ts
function recognizeIntent(text) {
  const input = text.trim();
  if (input.length === 0) {
    return { intent: "GENERAL_CHAT", confidence: 0.4, keywords: [] };
  }
  for (const rule of RULES) {
    for (const pattern of rule.patterns) {
      const match = pattern.exec(input);
      if (match !== null) {
        const keyword = rule.keywordGroup !== void 0 ? match[rule.keywordGroup] ?? "" : match[1] ?? match[0] ?? "";
        return {
          intent: rule.intent,
          confidence: rule.confidence,
          keywords: keyword.length > 0 ? [keyword] : []
        };
      }
    }
  }
  return { intent: "GENERAL_CHAT", confidence: 0.4, keywords: [] };
}
var RULES;
var init_recognizer = __esm({
  "../sdkwork-whatseek-common/packages/sdkwork-whatseek-intent-core/src/recognizer.ts"() {
    "use strict";
    init_define_SDKWORK_RUNTIME_ENV();
    RULES = [
      {
        intent: "SEND_MESSAGE",
        patterns: [
          /(?:给|替)([\u4e00-\u9fa5a-zA-Z0-9]{2,8})(?:发|送|说|留言)/u,
          /帮(?:我)?(?:给)?([\u4e00-\u9fa5a-zA-Z0-9]{2,8})(?:发消息|发个消息|发送|发信息|说)/u,
          /联系(?:一下)?([\u4e00-\u9fa5a-zA-Z0-9]{2,8})/u,
          /(发消息|发个消息|发送消息|发信息|send (?:a )?message)/iu
        ],
        confidence: 0.9,
        keywordGroup: 1
      },
      {
        intent: "SEARCH_SUPPLIER",
        patterns: [/(供应商|供货商|supplier)/iu],
        confidence: 0.9
      },
      {
        intent: "SEARCH_PRODUCT",
        patterns: [
          /((?:找|采购|进|买|批发)[\u4e00-\u9fa5]{0,12}(?:商品|货|产品|原料))|(商品|产品)搜索/u,
          /(采购|批发|进货)/u
        ],
        confidence: 0.8
      },
      {
        intent: "SEARCH_SERVICE",
        patterns: [/(服务商|外包|找.{0,6}服务|service provider)/iu],
        confidence: 0.8
      },
      {
        intent: "CREATE_AGENT",
        patterns: [/(?:创建|做一个|做个|生成|开发|搭)(?:一个|个)?[\s\S]{0,20}(agent|智能体|数字员工|自动化助手)/iu],
        confidence: 0.9
      },
      {
        intent: "SEARCH_AGENT",
        patterns: [
          /((?:找|找一个|找个|推荐)(?:一个)?[\s\S]{0,16}(?:agent|智能体|数字员工))|(agent|智能体)/iu
        ],
        confidence: 0.8
      },
      {
        intent: "CREATE_APP",
        patterns: [
          /(?:创建|做一个|做个|生成|开发|搭建|制作|写)(?:一个|个)?[\s\S]{0,16}(系统|应用|软件|网站|小程序|平台|app|工具|管理)/iu
        ],
        confidence: 0.9
      },
      {
        intent: "CREATE_CONTENT",
        patterns: [
          /(?:生成|做|创建|写|画|拍)(?:一个|一张|一段|一篇|个|张|段|篇)?[\s\S]{0,12}(海报|图片|视频|文章|标题|文案|logo|插图|封面)/iu
        ],
        confidence: 0.85
      },
      {
        intent: "EDIT_CONTENT",
        patterns: [
          /((?:修改|编辑|改成|换|调整)(?:一下)?[\s\S]{0,10}(?:图片|视频|文章|文案|标题|内容))|(把这张|把那个)/u
        ],
        confidence: 0.8
      },
      {
        intent: "USE_APP",
        patterns: [/((?:打开|运行|启动|使用)[\s\S]{0,8}(?:应用|app|软件|工具))|(打开[\s\S]{1,10})/iu],
        confidence: 0.75
      },
      {
        intent: "SEARCH_APP",
        patterns: [
          /(?:找|找找|找一个|找个|搜|搜索|推荐|有没有|想要|需要)(?:一个|个)?[\s\S]{0,12}(?:工具|应用|软件|app|平台)/iu,
          /(视频剪辑|图片编辑|标题生成|选品|剪辑|设计|记账|笔记|看板|crm|进销存)/iu
        ],
        confidence: 0.85
      },
      {
        intent: "SEARCH_PERSON",
        patterns: [/(?:找|查|搜)(?:一下|找)?(?:联系人|张三|李四|王五|赵六)/u, /联系人查找/u],
        confidence: 0.8
      },
      {
        intent: "EXECUTE_TASK",
        patterns: [/(执行|帮我跑|跑一下|自动化)[\s\S]{0,10}/u],
        confidence: 0.7
      }
    ];
  }
});

// ../sdkwork-whatseek-common/packages/sdkwork-whatseek-intent-core/src/index.ts
var init_src = __esm({
  "../sdkwork-whatseek-common/packages/sdkwork-whatseek-intent-core/src/index.ts"() {
    "use strict";
    init_define_SDKWORK_RUNTIME_ENV();
    init_recognizer();
  }
});

// ../sdkwork-whatseek-common/packages/sdkwork-whatseek-service-core/src/chat/chatClient.ts
function defaultScheduler(callback, delayMs) {
  const handle = globalThis.setTimeout(callback, delayMs);
  return () => {
    globalThis.clearTimeout(handle);
  };
}
function defaultStorage3() {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}
function extractContactName(text) {
  const patterns = [
    /(?:给|替|帮[\u4e00-\u9fa5]{0,2}?)([\u4e00-\u9fa5a-zA-Z0-9]{2,8})(?:发|送|说|留言|发消息)/u,
    /联系(?:一下)?([\u4e00-\u9fa5a-zA-Z0-9]{2,8})/u,
    /找([\u4e00-\u9fa5a-zA-Z0-9]{2,8})(?:发消息|说|留言)/u
  ];
  for (const pattern of patterns) {
    const match = pattern.exec(text);
    const name = match?.[1];
    if (name !== void 0 && name.length > 0) {
      return name;
    }
  }
  return null;
}
function extractDraftMessage(text) {
  const match = /(?:告诉(?:他|她|它)|跟(?:他|她)说|说|内容是)[：:]?\s*(.+)$/u.exec(text.trim());
  const draft = match?.[1];
  if (draft !== void 0 && draft.trim().length > 0) {
    return draft.trim();
  }
  return null;
}
function createMockChatClient(deps, options = {}) {
  const replyDelayMs = options.replyDelayMs ?? 320;
  const taskStepMs = options.taskStepMs ?? 600;
  const schedule = options.scheduler ?? defaultScheduler;
  const storage = options.storage === void 0 ? defaultStorage3() : options.storage;
  const delay = (ms) => new Promise((resolve) => {
    schedule(resolve, ms);
  });
  const saveDraft = (contactId, draft) => {
    if (storage === null) {
      return;
    }
    try {
      storage.setItem(DRAFT_KEY, `${contactId}
${draft}`);
    } catch {
    }
  };
  return {
    async handleSend(text) {
      const intent = recognizeIntent(text);
      await delay(replyDelayMs);
      const cards = [];
      switch (intent.intent) {
        case "SEARCH_APP": {
          const results = await deps.apps.searchApps(text);
          if (results.length > 0) {
            cards.push({ type: "app_results", apps: results.slice(0, 3) });
            return {
              contentKey: "whatseek.chat.reply.searchApp.found",
              contentParams: { count: results.length },
              cards
            };
          }
          const plan = deps.apps.draftCreationPlan(text);
          cards.push({
            type: "app_plan",
            title: plan.title,
            modules: plan.modules,
            requirement: text.trim()
          });
          return {
            contentKey: "whatseek.chat.reply.searchApp.notFoundCreate",
            cards
          };
        }
        case "CREATE_APP": {
          const plan = deps.apps.draftCreationPlan(text);
          cards.push({
            type: "app_plan",
            title: plan.title,
            modules: plan.modules,
            requirement: text.trim()
          });
          return { contentKey: "whatseek.chat.reply.createApp.plan", cards };
        }
        case "SEND_MESSAGE": {
          const name = extractContactName(text);
          const matches = name !== null ? await deps.contacts.searchContacts(name) : await deps.contacts.listContacts();
          const contact = matches[0];
          if (contact === void 0) {
            return { contentKey: "whatseek.chat.reply.sendMessage.contactNotFound" };
          }
          const draft = extractDraftMessage(text) ?? text.trim();
          saveDraft(contact.id, draft);
          cards.push({
            type: "send_message_confirm",
            contactId: contact.id,
            contactName: contact.name,
            draft
          });
          return { contentKey: "whatseek.chat.reply.sendMessage.confirm", cards };
        }
        case "SEARCH_PERSON": {
          const matches = await deps.contacts.searchContacts(text);
          if (matches.length > 0) {
            cards.push({ type: "contact_results", contacts: matches.slice(0, 4) });
            return { contentKey: "whatseek.chat.reply.searchPerson.found", cards };
          }
          return { contentKey: "whatseek.chat.reply.searchPerson.notFound" };
        }
        case "SEARCH_PRODUCT":
        case "SEARCH_SUPPLIER":
        case "SEARCH_SERVICE": {
          const domain = intent.intent === "SEARCH_SUPPLIER" ? "supplier" : intent.intent === "SEARCH_SERVICE" ? "service" : "product";
          cards.push({ type: "commerce_results", domain, items: COMMERCE_PRESETS[domain].slice(0, 3) });
          return {
            contentKey: intent.intent === "SEARCH_SUPPLIER" ? "whatseek.chat.reply.searchSupplier" : intent.intent === "SEARCH_SERVICE" ? "whatseek.chat.reply.searchService" : "whatseek.chat.reply.searchProduct",
            cards
          };
        }
        case "CREATE_CONTENT": {
          const task = await deps.tasks.createTask({ title: text.trim(), intent: intent.intent });
          void schedule(() => {
            void deps.tasks.updateTaskState(task.id, "running").then(() => delay(taskStepMs)).then(() => deps.tasks.updateTaskState(task.id, "completed", text.trim())).then((completed) => {
              void deps.messages.postTaskNotification(completed);
            }).catch(() => void 0);
          }, taskStepMs);
          return {
            contentKey: "whatseek.chat.reply.createContent.accepted",
            taskId: task.id
          };
        }
        case "SEARCH_AGENT":
        case "CREATE_AGENT":
        case "USE_AGENT":
        case "EDIT_CONTENT":
        case "USE_APP":
        case "EXECUTE_TASK":
        case "GENERAL_CHAT":
        default:
          return { contentKey: "whatseek.chat.reply.general" };
      }
    },
    async runCardAction(action) {
      switch (action.kind) {
        case "generate_app": {
          const task = await deps.tasks.createTask({
            title: action.requirement,
            intent: "CREATE_APP"
          });
          await deps.tasks.updateTaskState(task.id, "running");
          await delay(taskStepMs);
          const created = await deps.apps.createAppFromPlan(action.requirement, action.modules);
          const completed = await deps.tasks.updateTaskState(
            task.id,
            "completed",
            created.name
          );
          completed.createdAppId = created.id;
          void deps.messages.postTaskNotification(completed);
          return {
            message: "whatseek.chat.reply.action.appGenerated",
            messageParams: { name: created.name },
            createdAppId: created.id,
            taskId: task.id
          };
        }
        case "confirm_send_message": {
          const task = await deps.tasks.createTask({
            title: action.draft,
            intent: "SEND_MESSAGE"
          });
          await deps.tasks.updateTaskState(task.id, "running");
          const conversation = await deps.messages.openDirectConversation(action.contactId);
          await deps.messages.sendMessage(conversation.id, action.draft);
          await deps.messages.markRead(conversation.id);
          await deps.tasks.updateTaskState(task.id, "completed", conversation.title ?? conversation.id);
          return {
            message: "whatseek.chat.reply.action.messageSent",
            messageParams: { name: action.contactName },
            conversationId: conversation.id,
            taskId: task.id
          };
        }
        case "use_app":
        case "create_from_app":
        case "open_contact":
          return { message: "whatseek.chat.reply.action.navigated" };
        default: {
          const exhaustive = action;
          return exhaustive;
        }
      }
    }
  };
}
var DRAFT_KEY, COMMERCE_PRESETS;
var init_chatClient = __esm({
  "../sdkwork-whatseek-common/packages/sdkwork-whatseek-service-core/src/chat/chatClient.ts"() {
    "use strict";
    init_define_SDKWORK_RUNTIME_ENV();
    init_src();
    DRAFT_KEY = "whatseek.pending-send-drafts";
    COMMERCE_PRESETS = {
      product: [
        { id: "p-1", title: "\u9ED1\u8272\u5706\u9886 T \u6064 220g", subtitle: "\u7EAF\u68C9 \xB7 \u652F\u6301\u5B9A\u5236\u5370\u82B1 \xB7 \u8D77\u8BA2 100 \u4EF6", priceLabel: "\xA512.5/\u4EF6" },
        { id: "p-2", title: "\u901F\u5E72 T \u6064 \u6279\u53D1\u6B3E", subtitle: "\u901F\u5E72\u9762\u6599 \xB7 8 \u8272\u53EF\u9009 \xB7 \u8D77\u8BA2 50 \u4EF6", priceLabel: "\xA518/\u4EF6" },
        { id: "p-3", title: "\u91CD\u78C5\u7EAF\u8272 T \u6064", subtitle: "260g \u91CD\u78C5 \xB7 \u5C0F\u5355\u5FEB\u8FD4", priceLabel: "\xA525/\u4EF6" }
      ],
      supplier: [
        { id: "s-1", title: "\u4E0A\u6D77\u9526\u88F3\u670D\u9970\u6709\u9650\u516C\u53F8", subtitle: "T \u6064/\u536B\u8863 \xB7 \u652F\u6301\u5B9A\u5236 \xB7 7 \u5929\u6253\u6837", priceLabel: "\u8D77\u8BA2 \xA520 \u4EE5\u5185" },
        { id: "s-2", title: "\u5E7F\u5DDE\u4F70 clothes \u5236\u8863\u5382", subtitle: "\u8DE8\u5883\u5FEB\u8FD4 \xB7 1000 \u4EF6\u8D77 \xB7 SGS \u8BA4\u8BC1", priceLabel: "\xA511 \u8D77/\u4EF6" },
        { id: "s-3", title: "\u4E49\u4E4C\u5E02\u7693\u701A\u670D\u9970", subtitle: "\u73B0\u8D27\u6DF7\u6279 \xB7 \u4E00\u4EF6\u4EE3\u53D1", priceLabel: "\xA59.9 \u8D77/\u4EF6" }
      ],
      service: [
        { id: "sv-1", title: "\u8DE8\u5883\u4EE3\u8FD0\u8425\u670D\u52A1", subtitle: "\u5E97\u94FA\u642D\u5EFA + \u6295\u653E \xB7 \u6309\u6708\u670D\u52A1", priceLabel: "\xA53000/\u6708" },
        { id: "sv-2", title: "\u5546\u54C1\u62CD\u6444\u670D\u52A1", subtitle: "\u767D\u5E95\u56FE/\u573A\u666F\u56FE \xB7 48h \u4EA4\u4ED8", priceLabel: "\xA580/\u5F20" },
        { id: "sv-3", title: "\u72EC\u7ACB\u7AD9 SEO \u54A8\u8BE2", subtitle: "\u5173\u952E\u8BCD\u7B56\u7565 + \u5185\u5BB9\u89C4\u5212", priceLabel: "\xA51500/\u6B21" }
      ]
    };
  }
});

// ../sdkwork-whatseek-common/packages/sdkwork-whatseek-service-core/src/chat/tasksClient.ts
function defaultStorage4() {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}
function readTasks(storage) {
  if (storage === null) {
    return [];
  }
  try {
    const raw = storage.getItem(TASKS_KEY);
    const parsed = raw === null ? null : JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
function createMockTasksClient(options = {}) {
  const storage = options.storage === void 0 ? defaultStorage4() : options.storage;
  const now = options.now ?? (() => /* @__PURE__ */ new Date());
  let tasks = readTasks(storage);
  const persist = () => {
    if (storage !== null) {
      try {
        storage.setItem(TASKS_KEY, JSON.stringify(tasks));
      } catch {
      }
    }
  };
  return {
    async createTask(input) {
      const stamp = now().toISOString();
      const task = {
        id: `task-${stamp}-${Math.floor(Math.random() * 1e6).toString(36)}`,
        title: input.title,
        intent: input.intent,
        state: "pending",
        createdAt: stamp,
        updatedAt: stamp
      };
      tasks = [task, ...tasks];
      persist();
      return task;
    },
    async updateTaskState(taskId, state, resultSummary) {
      const existing = tasks.find((task) => task.id === taskId);
      if (existing === void 0) {
        throw new Error(`task not found: ${taskId}`);
      }
      const updated = {
        ...existing,
        state,
        updatedAt: now().toISOString(),
        ...resultSummary !== void 0 ? { resultSummary } : {}
      };
      tasks = tasks.map((task) => task.id === taskId ? updated : task);
      persist();
      return updated;
    },
    async getTask(taskId) {
      return tasks.find((task) => task.id === taskId) ?? null;
    },
    async listTasks() {
      return [...tasks];
    }
  };
}
var TASKS_KEY;
var init_tasksClient = __esm({
  "../sdkwork-whatseek-common/packages/sdkwork-whatseek-service-core/src/chat/tasksClient.ts"() {
    "use strict";
    init_define_SDKWORK_RUNTIME_ENV();
    TASKS_KEY = "whatseek.tasks";
  }
});

// ../sdkwork-whatseek-common/packages/sdkwork-whatseek-service-core/src/index.ts
var init_src2 = __esm({
  "../sdkwork-whatseek-common/packages/sdkwork-whatseek-service-core/src/index.ts"() {
    "use strict";
    init_define_SDKWORK_RUNTIME_ENV();
    init_inventory();
    init_appsClient();
    init_search();
    init_catalog();
    init_contactsClient();
    init_messagesClient();
    init_chatClient();
    init_tasksClient();
  }
});

// packages/sdkwork-whatseek-mp-chat/src/i18n/en-US/whatseek/chat/strings.json
var strings_default;
var init_strings = __esm({
  "packages/sdkwork-whatseek-mp-chat/src/i18n/en-US/whatseek/chat/strings.json"() {
    strings_default = {
      reply: {
        searchAppFound: "I found apps that fit:",
        searchAppNotFoundCreate: "No existing app matched \u2014 I can create one for you:",
        createAppPlan: "Sure, here is the plan:",
        sendMessageConfirm: "I found the contact. Please confirm before sending:",
        sendMessageContactNotFound: "I could not find that contact.",
        searchPersonFound: "Found these contacts:",
        searchPersonNotFound: "No matching contacts.",
        searchSupplier: "Here are matching suppliers (commerce preview):",
        commercePreview: "Commerce preview (full supply-demand network arrives in Phase 2):",
        createContentAccepted: "Got it! The task completed.",
        general: "I am WhatSeek AI. Ask me to find apps, create apps, find suppliers, or reach someone.",
        error: "Something went wrong. Please retry.",
        actionAppGenerated: 'Generated app "{name}" \u2014 see it under My apps.',
        actionMessageSent: "Message sent \u2014 continue the conversation in Messages.",
        actionNavigated: "Done."
      }
    };
  }
});

// packages/sdkwork-whatseek-mp-chat/src/i18n/zh-CN/whatseek/chat/strings.json
var strings_default2;
var init_strings2 = __esm({
  "packages/sdkwork-whatseek-mp-chat/src/i18n/zh-CN/whatseek/chat/strings.json"() {
    strings_default2 = {
      reply: {
        searchAppFound: "\u627E\u5230\u9002\u5408\u4F60\u7684\u5E94\u7528\uFF1A",
        searchAppNotFoundCreate: "\u6CA1\u6709\u627E\u5230\u73B0\u6210\u7684\u5E94\u7528 \u2014\u2014 \u6211\u53EF\u4EE5\u76F4\u63A5\u5E2E\u4F60\u521B\u5EFA\u4E00\u4E2A\uFF1A",
        createAppPlan: "\u597D\u7684\uFF0C\u6211\u51C6\u5907\u521B\u5EFA\uFF0C\u65B9\u6848\u5982\u4E0B\uFF1A",
        sendMessageConfirm: "\u6211\u627E\u5230\u4E86\u8054\u7CFB\u4EBA\uFF0C\u53D1\u9001\u524D\u8BF7\u786E\u8BA4\uFF1A",
        sendMessageContactNotFound: "\u901A\u8BAF\u5F55\u91CC\u6CA1\u6709\u627E\u5230\u8FD9\u4E2A\u8054\u7CFB\u4EBA\u3002",
        searchPersonFound: "\u627E\u5230\u8FD9\u4E9B\u8054\u7CFB\u4EBA\uFF1A",
        searchPersonNotFound: "\u6CA1\u6709\u627E\u5230\u76F8\u5173\u8054\u7CFB\u4EBA\u3002",
        searchSupplier: "\u4E3A\u4F60\u627E\u5230\u8FD9\u4E9B\u4F9B\u5E94\u5546\uFF08\u5546\u4E1A\u751F\u6001\u9884\u89C8\uFF09\uFF1A",
        commercePreview: "\u5546\u4E1A\u751F\u6001\u9884\u89C8\uFF08Phase 2 \u63A5\u5165\u5B8C\u6574\u4F9B\u9700\u7F51\u7EDC\uFF09\uFF1A",
        createContentAccepted: "\u6536\u5230\uFF01\u4EFB\u52A1\u5DF2\u5B8C\u6210\u3002",
        general: "\u6211\u662F\u95EE\u5BFB AI\u3002\u4F60\u53EF\u4EE5\u8BA9\u6211\u627E\u5E94\u7528\u3001\u521B\u5EFA\u5E94\u7528\u3001\u627E\u4F9B\u5E94\u5546\uFF0C\u6216\u8005\u8054\u7CFB\u67D0\u4EBA\u2014\u2014\u76F4\u63A5\u8BF4\u5C31\u884C\u3002",
        error: "\u51FA\u4E86\u70B9\u95EE\u9898\uFF0C\u8BF7\u91CD\u8BD5\u3002",
        actionAppGenerated: "\u5DF2\u751F\u6210\u5E94\u7528\u300C{name}\u300D\uFF0C\u53EF\u4EE5\u5728\u300C\u6211\u7684\u5E94\u7528\u300D\u4E2D\u67E5\u770B\u3002",
        actionMessageSent: "\u6D88\u606F\u5DF2\u53D1\u9001\uFF0C\u53EF\u4EE5\u5728\u300C\u6D88\u606F\u300D\u4E2D\u7EE7\u7EED\u5BF9\u8BDD\u3002",
        actionNavigated: "\u597D\u7684\u3002"
      }
    };
  }
});

// packages/sdkwork-whatseek-mp-chat/src/index.ts
var src_exports = {};
__export(src_exports, {
  replyText: () => replyText,
  runCardAction: () => runCardAction,
  sendChatTurn: () => sendChatTurn,
  setChatLocale: () => setChatLocale,
  taskStatus: () => taskStatus,
  toCardView: () => toCardView
});
function setChatLocale(locale) {
  chatLocale = locale;
}
function replyText(reply) {
  const key = reply.contentKey.replace("whatseek.chat.reply.", "");
  const entry = REPLY_TEXT[key];
  return entry !== void 0 ? entry[chatLocale] : reply.contentKey;
}
function toCardView(cards) {
  if (cards === void 0 || cards.length === 0) {
    return null;
  }
  const view = { type: cards[0].type, apps: [], plan: null, sendMessage: null, commerce: null, contacts: [] };
  for (const card of cards) {
    if (card.type === "app_results") {
      for (const { app, reason } of card.apps) {
        view.apps.push({ id: app.id, name: app.name, summary: app.summary, priceLabel: app.priceLabel, reason });
      }
    } else if (card.type === "app_plan") {
      view.plan = { title: card.title, modules: [...card.modules], requirement: card.requirement };
    } else if (card.type === "send_message_confirm") {
      view.sendMessage = { contactId: card.contactId, contactName: contactNameOf(card), draft: card.draft };
    } else if (card.type === "commerce_results") {
      view.commerce = { domain: card.domain, items: card.items.map((item) => ({ ...item })) };
    } else if (card.type === "contact_results") {
      for (const contact of card.contacts) {
        view.contacts.push({ id: contact.id, name: contact.name, bio: contact.bio });
      }
    }
  }
  return view;
}
function contactNameOf(card) {
  return card.contactName;
}
async function sendChatTurn(text) {
  const chat = getWhatseekClient("chat");
  const reply = await chat.handleSend(text);
  return { replyText: replyText(reply), cards: toCardView(reply.cards), taskId: reply.taskId };
}
async function runCardAction(action) {
  const chat = getWhatseekClient("chat");
  const outcome = await chat.runCardAction(action);
  return replyText({ contentKey: outcome.message });
}
async function taskStatus(taskId) {
  const task = await getWhatseekClient("tasks").getTask(taskId);
  if (task === null) {
    return null;
  }
  return { id: task.id, title: task.title, state: task.state, resultSummary: task.resultSummary };
}
var REPLY_TEXT, chatLocale;
var init_src3 = __esm({
  "packages/sdkwork-whatseek-mp-chat/src/index.ts"() {
    "use strict";
    init_define_SDKWORK_RUNTIME_ENV();
    init_src2();
    init_strings();
    init_strings2();
    REPLY_TEXT = {
      searchAppFound: { "zh-CN": strings_default2.reply.searchAppFound, "en-US": strings_default.reply.searchAppFound },
      searchAppNotFoundCreate: { "zh-CN": strings_default2.reply.searchAppNotFoundCreate, "en-US": strings_default.reply.searchAppNotFoundCreate },
      createAppPlan: { "zh-CN": strings_default2.reply.createAppPlan, "en-US": strings_default.reply.createAppPlan },
      sendMessageConfirm: { "zh-CN": strings_default2.reply.sendMessageConfirm, "en-US": strings_default.reply.sendMessageConfirm },
      sendMessageContactNotFound: { "zh-CN": strings_default2.reply.sendMessageContactNotFound, "en-US": strings_default.reply.sendMessageContactNotFound },
      searchPersonFound: { "zh-CN": strings_default2.reply.searchPersonFound, "en-US": strings_default.reply.searchPersonFound },
      searchPersonNotFound: { "zh-CN": strings_default2.reply.searchPersonNotFound, "en-US": strings_default.reply.searchPersonNotFound },
      searchSupplier: { "zh-CN": strings_default2.reply.searchSupplier, "en-US": strings_default.reply.searchSupplier },
      commercePreview: { "zh-CN": strings_default2.reply.commercePreview, "en-US": strings_default.reply.commercePreview },
      createContentAccepted: { "zh-CN": strings_default2.reply.createContentAccepted, "en-US": strings_default.reply.createContentAccepted },
      general: { "zh-CN": strings_default2.reply.general, "en-US": strings_default.reply.general },
      error: { "zh-CN": strings_default2.reply.error, "en-US": strings_default.reply.error },
      actionAppGenerated: { "zh-CN": strings_default2.reply.actionAppGenerated, "en-US": strings_default.reply.actionAppGenerated },
      actionMessageSent: { "zh-CN": strings_default2.reply.actionMessageSent, "en-US": strings_default.reply.actionMessageSent },
      actionNavigated: { "zh-CN": strings_default2.reply.actionNavigated, "en-US": strings_default.reply.actionNavigated }
    };
    chatLocale = "zh-CN";
  }
});

// packages/sdkwork-whatseek-mp-apps/src/index.ts
var src_exports2 = {};
__export(src_exports2, {
  appsPort: () => appsPort,
  createAppFromPlan: () => createAppFromPlan,
  deleteMyApp: () => deleteMyApp,
  draftCreationPlan: () => draftCreationPlan,
  favoriteApp: () => favoriteApp,
  generateApp: () => generateApp,
  getApp: () => getApp,
  listAppsByCategory: () => listAppsByCategory,
  listCategories: () => listCategories,
  listFavoriteApps: () => listFavoriteApps,
  listMyApps: () => listMyApps,
  listRecentApps: () => listRecentApps,
  listRecommended: () => listRecommended,
  openApp: () => openApp,
  publishApp: () => publishApp,
  searchApps: () => searchApps,
  toggleFavoriteApp: () => toggleFavoriteApp
});
function appsPort() {
  return getWhatseekClient("apps");
}
async function searchApps(query) {
  return appsPort().searchApps(query);
}
async function listRecommended() {
  return appsPort().listRecommended();
}
async function listCategories() {
  return appsPort().listCategories();
}
async function getApp(appId) {
  return appsPort().getApp(appId);
}
async function listMyApps() {
  return appsPort().listMyApps();
}
async function openApp(appId) {
  await appsPort().recordRecent(appId);
}
async function favoriteApp(appId) {
  return appsPort().toggleFavorite(appId);
}
async function generateApp(requirement) {
  const port = appsPort();
  const plan = port.draftCreationPlan(requirement);
  return port.createAppFromPlan(requirement, plan.modules);
}
function draftCreationPlan(requirement) {
  return appsPort().draftCreationPlan(requirement);
}
async function createAppFromPlan(requirement, modules) {
  return appsPort().createAppFromPlan(requirement, modules);
}
async function publishApp(appId) {
  return appsPort().publishApp(appId);
}
async function deleteMyApp(appId) {
  await appsPort().deleteMyApp(appId);
}
async function listFavoriteApps() {
  return appsPort().listFavorites();
}
async function toggleFavoriteApp(appId) {
  return appsPort().toggleFavorite(appId);
}
async function listRecentApps() {
  return appsPort().listRecent();
}
async function listAppsByCategory(categoryId) {
  return appsPort().listByCategory(categoryId);
}
var init_src4 = __esm({
  "packages/sdkwork-whatseek-mp-apps/src/index.ts"() {
    "use strict";
    init_define_SDKWORK_RUNTIME_ENV();
    init_src2();
  }
});

// packages/sdkwork-whatseek-mp-contacts/src/index.ts
var src_exports3 = {};
__export(src_exports3, {
  contactsPort: () => contactsPort,
  getContact: () => getContact,
  kindLabel: () => kindLabel,
  listContacts: () => listContacts,
  searchContacts: () => searchContacts
});
function contactsPort() {
  return getWhatseekClient("contacts");
}
async function listContacts() {
  return contactsPort().listContacts();
}
async function searchContacts(query) {
  return contactsPort().searchContacts(query);
}
async function getContact(contactId) {
  return contactsPort().getContact(contactId);
}
function kindLabel(kind) {
  return KIND_LABELS[kind] ?? kind;
}
var KIND_LABELS;
var init_src5 = __esm({
  "packages/sdkwork-whatseek-mp-contacts/src/index.ts"() {
    "use strict";
    init_define_SDKWORK_RUNTIME_ENV();
    init_src2();
    KIND_LABELS = {
      person: "\u8054\u7CFB\u4EBA",
      group: "\u7FA4\u7EC4",
      org: "\u4F01\u4E1A\u4E0E\u5546\u5BB6",
      agent: "Agent",
      assistant: "AI \u52A9\u624B"
    };
  }
});

// packages/sdkwork-whatseek-mp-messages/src/index.ts
var src_exports4 = {};
__export(src_exports4, {
  listConversations: () => listConversations,
  listMessages: () => listMessages,
  markRead: () => markRead,
  messagesPort: () => messagesPort,
  openDirectConversation: () => openDirectConversation,
  sendMessage: () => sendMessage,
  unreadTotal: () => unreadTotal
});
function messagesPort() {
  return getWhatseekClient("messages");
}
async function listConversations() {
  return messagesPort().listConversations();
}
async function listMessages(conversationId) {
  return messagesPort().listMessages(conversationId);
}
async function sendMessage(conversationId, content) {
  return messagesPort().sendMessage(conversationId, content);
}
async function markRead(conversationId) {
  await messagesPort().markRead(conversationId);
}
async function unreadTotal() {
  return messagesPort().getUnreadTotal();
}
async function openDirectConversation(contactId) {
  return messagesPort().openDirectConversation(contactId);
}
var init_src6 = __esm({
  "packages/sdkwork-whatseek-mp-messages/src/index.ts"() {
    "use strict";
    init_define_SDKWORK_RUNTIME_ENV();
    init_src2();
  }
});

// packages/sdkwork-whatseek-mp-profile/src/index.ts
var src_exports5 = {};
__export(src_exports5, {
  getAppearanceSettings: () => getAppearanceSettings,
  loadProfileSummary: () => loadProfileSummary,
  setAppearanceSettings: () => setAppearanceSettings
});
async function loadProfileSummary() {
  const [conversations, myApps, contacts] = await Promise.all([
    getWhatseekClient("messages").listConversations(),
    getWhatseekClient("apps").listMyApps(),
    getWhatseekClient("contacts").listContacts()
  ]);
  return {
    user: { id: "visitor", name: "\u8BBF\u5BA2", avatar: "\u{1F642}", isVisitor: true },
    chats: conversations.length,
    apps: myApps.length,
    contacts: contacts.length
  };
}
function getAppearanceSettings() {
  return { ...settings };
}
function setAppearanceSettings(next) {
  settings = { ...settings, ...next };
  return { ...settings };
}
var settings;
var init_src7 = __esm({
  "packages/sdkwork-whatseek-mp-profile/src/index.ts"() {
    "use strict";
    init_define_SDKWORK_RUNTIME_ENV();
    init_src2();
    settings = { colorMode: "light", locale: "zh-CN" };
  }
});

// packages/sdkwork-whatseek-mp-commons/src/index.ts
var src_exports6 = {};
__export(src_exports6, {
  TASK_STATE_LABELS: () => TASK_STATE_LABELS,
  formatCountLabel: () => formatCountLabel,
  truncate: () => truncate
});
function formatCountLabel(count) {
  if (count >= 1e4) {
    const wan = count / 1e4;
    return `${wan >= 10 ? wan.toFixed(0) : wan.toFixed(1)}\u4E07`;
  }
  return String(count);
}
function truncate(text, max) {
  return text.length > max ? `${text.slice(0, max)}\u2026` : text;
}
var TASK_STATE_LABELS;
var init_src8 = __esm({
  "packages/sdkwork-whatseek-mp-commons/src/index.ts"() {
    "use strict";
    init_define_SDKWORK_RUNTIME_ENV();
    TASK_STATE_LABELS = {
      pending: "\u6392\u961F\u4E2D",
      running: "\u6267\u884C\u4E2D",
      waiting_confirmation: "\u5F85\u786E\u8BA4",
      completed: "\u5DF2\u5B8C\u6210",
      failed: "\u5931\u8D25",
      cancelled: "\u5DF2\u53D6\u6D88",
      expired: "\u5DF2\u8FC7\u671F"
    };
  }
});

// src/bootstrap/runtime.ts
var runtime_exports = {};
__export(runtime_exports, {
  appApi: () => appApi,
  bootstrapRuntime: () => bootstrapRuntime
});
module.exports = __toCommonJS(runtime_exports);
init_define_SDKWORK_RUNTIME_ENV();

// packages/sdkwork-whatseek-mp-core/src/index.ts
init_define_SDKWORK_RUNTIME_ENV();
init_src2();
var hostPort = null;
function bindMiniProgramHost(port) {
  hostPort = port;
}
function getMiniProgramHost() {
  if (hostPort === null) {
    throw new Error("mini-program host not bound; call bindMiniProgramHost in bootstrap/runtime.ts");
  }
  return hostPort;
}
var runtimeConfig = null;
function bindRuntimeConfig(config) {
  runtimeConfig = config;
}
function bootstrapMiniProgramClients() {
  resetWhatseekClients();
  const apps = createMockAppsClient();
  const contacts = createMockContactsClient();
  const messages = createMockMessagesClient();
  const tasks = createMockTasksClient();
  const chat = createMockChatClient({ apps, contacts, messages, tasks });
  registerWhatseekClient("apps", apps);
  registerWhatseekClient("contacts", contacts);
  registerWhatseekClient("messages", messages);
  registerWhatseekClient("tasks", tasks);
  registerWhatseekClient("chat", chat);
}

// packages/sdkwork-whatseek-mp-shell/src/index.ts
init_define_SDKWORK_RUNTIME_ENV();

// ../sdkwork-whatseek-common/packages/sdkwork-whatseek-route-core/src/index.ts
init_define_SDKWORK_RUNTIME_ENV();

// ../sdkwork-whatseek-common/packages/sdkwork-whatseek-route-core/src/tabs.ts
init_define_SDKWORK_RUNTIME_ENV();
var WHATSEEK_TABS = [
  { id: "chat", path: "/chat", titleKey: "whatseek.shell.tab.chat" },
  { id: "apps", path: "/apps", titleKey: "whatseek.shell.tab.apps" },
  { id: "contacts", path: "/contacts", titleKey: "whatseek.shell.tab.contacts" },
  { id: "messages", path: "/messages", titleKey: "whatseek.shell.tab.messages" },
  { id: "profile", path: "/profile", titleKey: "whatseek.shell.tab.profile" }
];

// ../sdkwork-whatseek-common/packages/sdkwork-whatseek-route-core/src/routes.ts
init_define_SDKWORK_RUNTIME_ENV();

// packages/sdkwork-whatseek-mp-shell/src/index.ts
var TAB_LABELS = {
  chat: "\u5BF9\u8BDD",
  apps: "\u5E94\u7528",
  contacts: "\u901A\u8BAF\u5F55",
  messages: "\u6D88\u606F",
  profile: "\u6211\u7684"
};
var TAB_PAGE_PATHS = WHATSEEK_TABS.map((tab) => `pages/${tab.id}/index`);
var PAGE_TITLES = {
  "pages/chat/index": "\u5BF9\u8BDD",
  "pages/apps/index": "\u5E94\u7528\u4E2D\u5FC3",
  "pages/contacts/index": "\u901A\u8BAF\u5F55",
  "pages/messages/index": "\u6D88\u606F",
  "pages/profile/index": "\u6211\u7684",
  "detail/apps-detail/index": "\u5E94\u7528\u8BE6\u60C5",
  "detail/conversation/index": "\u4F1A\u8BDD"
};

// src/bootstrap/runtime.ts
function bindWxHost() {
  bindMiniProgramHost({
    navigateTo(url) {
      wx.navigateTo({ url });
    },
    switchTab(url) {
      wx.switchTab({ url });
    },
    showToast(title) {
      wx.showToast({ title, icon: "none" });
    }
  });
}
function bootstrapRuntime() {
  bindRuntimeConfig(define_SDKWORK_RUNTIME_ENV_default);
  bindWxHost();
  bootstrapMiniProgramClients();
  const chat = (init_src3(), __toCommonJS(src_exports));
  const apps = (init_src4(), __toCommonJS(src_exports2));
  const contacts = (init_src5(), __toCommonJS(src_exports3));
  const messages = (init_src6(), __toCommonJS(src_exports4));
  const profile = (init_src7(), __toCommonJS(src_exports5));
  const commons = (init_src8(), __toCommonJS(src_exports6));
  return {
    chat: {
      async send(text) {
        return chat.sendChatTurn(text);
      },
      async runAction(action) {
        return chat.runCardAction(action);
      },
      taskStatus: (taskId) => chat.taskStatus(taskId)
    },
    apps: {
      search: (query) => apps.searchApps(query),
      recommended: () => apps.listRecommended(),
      categories: () => apps.listCategories(),
      detail: (appId) => apps.getApp(appId),
      myApps: () => apps.listMyApps(),
      open: (appId) => apps.openApp(appId),
      generate: (requirement) => apps.generateApp(requirement),
      publish: (appId) => apps.publishApp(appId),
      draftPlan: (requirement) => apps.draftCreationPlan(requirement),
      createFromPlan: (requirement, modules) => apps.createAppFromPlan(requirement, modules),
      deleteMyApp: (appId) => apps.deleteMyApp(appId),
      favorites: () => apps.listFavoriteApps(),
      toggleFavorite: (appId) => apps.toggleFavoriteApp(appId),
      recents: () => apps.listRecentApps(),
      byCategory: (categoryId) => apps.listAppsByCategory(categoryId)
    },
    contacts: {
      search: (query) => contacts.searchContacts(query),
      detail: (contactId) => contacts.getContact(contactId)
    },
    messages: {
      conversations: () => messages.listConversations(),
      thread: (conversationId) => messages.listMessages(conversationId),
      send: (conversationId, content) => messages.sendMessage(conversationId, content),
      markRead: (conversationId) => messages.markRead(conversationId),
      unread: () => messages.unreadTotal(),
      openDirect: (contactId) => messages.openDirectConversation(contactId)
    },
    profile: {
      summary: () => profile.loadProfileSummary(),
      getAppearance: () => profile.getAppearanceSettings(),
      setAppearance: (next) => profile.setAppearanceSettings(next),
      setLocale: (locale) => {
        profile.setAppearanceSettings({ locale });
        chat.setChatLocale(locale);
      }
    },
    shell: {
      tabs: TAB_PAGE_PATHS,
      labels: { ...TAB_LABELS },
      titles: { ...PAGE_TITLES },
      toast: (title) => getMiniProgramHost().showToast(title),
      navigate: (url) => getMiniProgramHost().navigateTo(url),
      taskStateLabel: (state) => commons.TASK_STATE_LABELS[state] ?? state
    }
  };
}
var appApi = bootstrapRuntime();
