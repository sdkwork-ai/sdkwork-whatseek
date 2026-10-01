/**
 * SDK client registry — ownership lives in `@sdkwork/whatseek-service-core`;
 * re-exported for h5 consumers.
 */

export {
  getWhatseekClient,
  hasWhatseekClient,
  registerWhatseekClient,
  resetWhatseekClients,
} from '@sdkwork/whatseek-service-core';
