/**
 * Ownership shim (APP_H5 §2): the root `src/shell` re-exports the shell
 * package; the real MobileLayout/TabBar implementation lives in
 * `@sdkwork/whatseek-h5-shell`.
 */

export { MobileLayout, TabBar } from '@sdkwork/whatseek-h5-shell';
