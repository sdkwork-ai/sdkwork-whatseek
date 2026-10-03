import { ShellColumn } from './ShellColumn.js';

/**
 * Stack-presentation shell for secondary screens (route table `tab: null`):
 * the same content column as the tab shell without the bottom tab bar.
 * Tab-bar visibility is decided at composition time from the route table
 * partition, never inside a screen (APP_H5_ARCHITECTURE_SPEC.md §11).
 */
export function MobileStackLayout() {
  return <ShellColumn />;
}
