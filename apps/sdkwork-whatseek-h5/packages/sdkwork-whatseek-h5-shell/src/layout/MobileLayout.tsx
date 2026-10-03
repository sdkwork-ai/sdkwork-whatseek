import { TabBar } from '../navigation/TabBar.js';
import { ShellColumn } from './ShellColumn.js';

/**
 * Phone-first five-tab shell (PRD §7): content column + bottom tab bar with
 * safe area handling (APP_H5_ARCHITECTURE_SPEC.md §10). Composition mounts it
 * only for the tab-root routes of the composed route table; secondary screens
 * present through MobileStackLayout so the tab bar never renders above them
 * (APP_H5_ARCHITECTURE_SPEC.md §11).
 */
export function MobileLayout() {
  return <ShellColumn bottomChrome={<TabBar />} />;
}
