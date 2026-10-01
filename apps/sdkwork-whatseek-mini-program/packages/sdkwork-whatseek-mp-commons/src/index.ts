/**
 * Public export boundary of `@sdkwork/whatseek-mp-commons` — view-model
 * helpers shared by the mini-program pages (no `wx.*`, no Page()/Component().
 */

import type { TaskState } from '@sdkwork/whatseek-service-core';

/** zh-CN task labels (PRD §41) — WXML renders them from the view model. */
export const TASK_STATE_LABELS: Record<TaskState, string> = {
  pending: '排队中',
  running: '执行中',
  waiting_confirmation: '待确认',
  completed: '已完成',
  failed: '失败',
  cancelled: '已取消',
  expired: '已过期',
};

export function formatCountLabel(count: number): string {
  if (count >= 10000) {
    const wan = count / 10000;
    return `${wan >= 10 ? wan.toFixed(0) : wan.toFixed(1)}万`;
  }
  return String(count);
}

export function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}
