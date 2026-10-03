/** Catalog data — ownership lives in `@sdkwork/whatseek-service-core`; re-exported for h5 consumers. */

export {
  WHATSEEK_CATALOG,
  WHATSEEK_CATEGORIES,
  DEFAULT_CREATION_MODULES,
  planModulesForRequirement,
} from '@sdkwork/whatseek-service-core';

export {
  WHATSEEK_HOME_COLLECTIONS,
  WHATSEEK_HOME_HEROES,
  WHATSEEK_HOME_STORIES,
  buildWhatseekHomeFeed,
  findWhatseekCollection,
  listWhatseekChartApps,
  listWhatseekCollectionApps,
} from '@sdkwork/whatseek-service-core';
