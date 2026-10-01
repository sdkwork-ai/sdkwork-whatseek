/** Mock AI chat client — ownership lives in `@sdkwork/whatseek-service-core`; re-exported for h5 consumers. */

export {
  createMockChatClient,
  type MockChatClientDeps,
  type MockChatClientOptions,
  type Scheduler,
} from '@sdkwork/whatseek-service-core';
