export function cx(...values: readonly (string | false | null | undefined)[]): string {
  return values.filter((value): value is string => typeof value === 'string' && value.length > 0).join(' ');
}

export function formatCountLabel(count: number): string {
  if (count >= 10000) {
    const wan = count / 10000;
    const label = wan >= 10 ? wan.toFixed(0) : wan.toFixed(1);
    return `${label}万`;
  }
  return String(count);
}
