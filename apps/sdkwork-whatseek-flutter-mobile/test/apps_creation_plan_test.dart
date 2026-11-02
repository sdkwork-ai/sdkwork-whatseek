// The navbar "+" entries seed page briefs (创建企业官网 / 新建网页 / 活动落地页 /
// 个人主页). The planner must read those as website requests — pages plus a
// site data model — instead of matching the domain keywords inside them
// ("客户案例" is not a CRM ask). Non-page briefs keep the domain derivations.
import 'package:flutter_test/flutter_test.dart';

import 'package:sdkwork_whatseek_flutter_mobile_core/sdkwork_whatseek_flutter_mobile_core.dart';

void main() {
  group('draftCreationPlan', () {
    final MockAppsClient client = MockAppsClient();

    test('company_website_brief_plans_pages_not_a_crm_domain', () {
      final plan = client.draftCreationPlan(
        '帮我做一个企业官网：包含公司介绍、产品与服务、客户案例和联系方式，风格简洁专业。',
      );

      expect(plan.modules, contains('关于我们'));
      expect(plan.pages, contains('联系表单页'));
      expect(plan.dataModel, contains('询盘表单'));
      // The brand/CRM keywords inside the brief must not hijack the plan.
      expect(plan.modules, isNot(contains('客户列表')));
      expect(plan.dataModel, isNot(contains('商机')));
    });

    test('plain_web_page_brief_plans_a_page_set', () {
      final plan = client.draftCreationPlan('帮我新建一个网页，页面主题和内容我稍后补充。');

      expect(plan.modules, contains('首页'));
      expect(plan.pages, contains('首页'));
      expect(plan.dataModel, contains('页面内容'));
    });

    test('non_page_brief_keeps_its_domain_plan', () {
      final plan = client.draftCreationPlan('订单管理');

      expect(plan.dataModel, isNot(contains('询盘表单')));
      expect(plan.modules, isNot(contains('关于我们')));
    });
  });
}
