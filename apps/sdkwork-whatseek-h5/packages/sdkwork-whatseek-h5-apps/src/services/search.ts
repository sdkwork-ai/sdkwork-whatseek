/** Search scoring — ownership lives in `@sdkwork/whatseek-service-core`; re-exported for h5 consumers. */

export {
  extractSearchKeywords,
  scoreAppForKeywords,
  type ScoredApp,
  type WhatseekAppLike,
} from '@sdkwork/whatseek-service-core';
