import { describe, expect, it } from 'vitest';

import { cx, formatCountLabel } from '../src/utils/format.js';

describe('cx class helper', () => {
  it('joins_only_truthy_string_values', () => {
    expect(cx('a', false, undefined, 'b', null, 'c')).toBe('a b c');
  });

  it('returns_an_empty_string_when_nothing_is_truthy', () => {
    expect(cx(false, null, undefined)).toBe('');
  });
});

describe('formatCountLabel', () => {
  it('keeps_small_counts_verbatim', () => {
    expect(formatCountLabel(8123)).toBe('8123');
  });

  it('formats_ten_thousand_plus_as_wan_with_one_decimal', () => {
    expect(formatCountLabel(12000)).toBe('1.2万');
  });

  it('formats_large_counts_as_wan_without_decimal', () => {
    expect(formatCountLabel(234000)).toBe('23万');
  });
});
