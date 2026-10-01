import { cx } from '../utils/format.js';

export interface AvatarProps {
  /** Emoji glyph or single character rendered inside the tile. */
  glyph: string;
  /** Tailwind-agnostic tint class for the tile background. */
  tone?: 'brand' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
}

const TONE_CLASSES: Record<NonNullable<AvatarProps['tone']>, string> = {
  brand: 'bg-brand-soft text-brand',
  success: 'bg-success/15 text-success',
  warning: 'bg-warning/15 text-warning',
  danger: 'bg-danger/15 text-danger',
  info: 'bg-info/15 text-info',
};

const SIZE_CLASSES: Record<NonNullable<AvatarProps['size']>, string> = {
  sm: 'h-8 w-8 text-base',
  md: 'h-11 w-11 text-xl',
  lg: 'h-16 w-16 text-3xl',
};

export function Avatar({ glyph, tone = 'brand', size = 'md' }: AvatarProps) {
  return (
    <span
      aria-hidden="true"
      className={cx(
        'inline-flex shrink-0 items-center justify-center rounded-2xl select-none',
        TONE_CLASSES[tone],
        SIZE_CLASSES[size],
      )}
    >
      {glyph}
    </span>
  );
}
