import { useTranslation } from 'react-i18next';

import type { TaskState } from '@sdkwork/whatseek-pc-core';

import { cx } from '../services/chatStyles.js';

const STATE_TONE: Record<TaskState, string> = {
  pending: 'bg-panel-muted text-muted',
  running: 'bg-brand-soft text-brand',
  waiting_confirmation: 'bg-warning/15 text-warning',
  completed: 'bg-success/15 text-success',
  failed: 'bg-danger/15 text-danger',
  cancelled: 'bg-panel-muted text-muted',
  expired: 'bg-panel-muted text-muted',
};

/** Compact AI task state chip (PRD §41). */
export function TaskChip({ state }: { state: TaskState }) {
  const { t } = useTranslation();
  return (
    <span
      data-task-state={state}
      className={cx(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.625rem] font-medium',
        STATE_TONE[state],
      )}
    >
      {state === 'running' || state === 'pending' ? (
        <span aria-hidden="true" className="h-2 w-2 animate-spin rounded-full border border-current border-t-transparent" />
      ) : state === 'completed' ? (
        <span aria-hidden="true">✓</span>
      ) : null}
      {t(`whatseek.chat.task.${state}`)}
    </span>
  );
}
