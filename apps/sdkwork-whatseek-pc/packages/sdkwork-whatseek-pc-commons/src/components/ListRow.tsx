import type { ReactNode } from 'react';

import { cx } from '../utils/format.js';

export interface ListRowProps {
  leading?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  trailing?: ReactNode;
  onClick?: () => void;
}

/**
 * One tappable list row. The whole row body is a button; `trailing` renders
 * outside that button so it can contain its own controls without invalid
 * nested interactive elements.
 */
export function ListRow({ leading, title, description, trailing, onClick }: ListRowProps) {
  const body = (
    <>
      {leading}
      <span className="min-w-0 flex-1 text-left">
        <span className="block truncate text-sm font-medium text-primary">{title}</span>
        {description !== undefined && description !== null ? (
          <span className="mt-0.5 block truncate text-xs text-muted">{description}</span>
        ) : null}
      </span>
    </>
  );
  return (
    <div className={cx('flex w-full items-center', onClick === undefined && 'px-4 py-3')}>
      {onClick === undefined ? (
        <span className="flex min-w-0 flex-1 items-center gap-3">{body}</span>
      ) : (
        <button
          type="button"
          onClick={onClick}
          className={cx(
            'flex min-w-0 flex-1 items-center gap-3 px-4 py-3 text-left',
            'transition-colors hover:bg-panel-muted active:bg-panel-muted',
          )}
        >
          {body}
        </button>
      )}
      {trailing !== undefined && trailing !== null ? (
        <div className="flex shrink-0 items-center gap-1 pr-3">{trailing}</div>
      ) : null}
    </div>
  );
}

export function SectionHeader({ title, action }: { title: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between px-4 pt-5 pb-2">
      <h2 className="text-sm font-semibold text-primary">{title}</h2>
      {action}
    </div>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  // Full-bleed section: edge-to-edge panel with hairline top/bottom rules —
  // native mobile list styling, no page gutters.
  return (
    <div className={cx('w-full overflow-hidden border-y border-border-subtle bg-panel', className)}>
      {children}
    </div>
  );
}
