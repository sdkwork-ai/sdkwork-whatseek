/**
 * Intent recognition — ownership moved to the shared package family
 * (`@sdkwork/whatseek-intent-core`). This module re-exports the recognizer so
 * the h5-chat public surface stays stable.
 */

export { recognizeIntent } from '@sdkwork/whatseek-intent-core';
