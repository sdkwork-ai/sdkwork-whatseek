import type { ReactNode } from 'react';

import { useTranslation } from 'react-i18next';

import { cx } from '../utils/format.js';

export type ScreenStateKind = 'loading' | 'empty' | 'error' | 'permission-denied' | 'success';

export interface ScreenStateProps {
  state: ScreenStateKind;
  /** i18n key overriding the built-in title for the active non-success state. */
  titleKey?: string | undefined;
  /** i18n key overriding the built-in description for the active non-success state. */
  descriptionKey?: string | undefined;
  onRetry?: (() => void) | undefined;
  children?: ReactNode;
}

/**
 * Renders one of the five mandatory UI states (FRONTEND_CODE_SPEC.md §11):
 * loading, empty, error, permission-denied, success. `success` renders
 * `children`.
 */
export function ScreenState({ state, titleKey, descriptionKey, onRetry, children }: ScreenStateProps) {
  const { t } = useTranslation();
  if (state === 'success') {
    return <>{children}</>;
  }
  const title = t(titleKey ?? `whatseek.commons.state.${state}.title`);
  const description =
    descriptionKey !== undefined ? t(descriptionKey) : t(`whatseek.commons.state.${state}.description`);
  return (
    <div
      data-screen-state={state}
      className="flex flex-1 flex-col items-center justify-center gap-3 px-8 py-16 text-center"
    >
      {state === 'loading' ? (
        <span
          aria-hidden="true"
          className="h-8 w-8 animate-spin rounded-full border-2 border-border-strong border-t-brand"
        />
      ) : (
        <span aria-hidden="true" className="text-3xl">
          {state === 'empty' ? '🪄' : state === 'error' ? '⚠️' : '🔒'}
        </span>
      )}
      <p className="text-sm font-medium text-primary">{title}</p>
      <p className="max-w-60 text-xs text-muted">{description}</p>
      {state === 'error' && onRetry !== undefined ? (
        <button
          type="button"
          onClick={onRetry}
          className={cx(
            'mt-1 rounded-full bg-brand px-4 py-1.5 text-xs font-medium text-white',
            'hover:bg-brand-hover active:opacity-80',
          )}
        >
          {t('whatseek.commons.state.retry')}
        </button>
      ) : null}
    </div>
  );
}
