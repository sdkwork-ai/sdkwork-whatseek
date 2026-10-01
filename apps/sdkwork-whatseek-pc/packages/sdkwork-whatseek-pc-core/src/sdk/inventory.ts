/** SDK client registry — ownership lives in `@sdkwork/whatseek-service-core`; re-exported. */

export {
  getWhatseekClient,
  hasWhatseekClient,
  registerWhatseekClient,
  resetWhatseekClients,
} from '@sdkwork/whatseek-service-core';
