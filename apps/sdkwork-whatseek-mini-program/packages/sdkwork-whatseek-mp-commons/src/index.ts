/**
 * Public export boundary of `@sdkwork/whatseek-mp-commons` — view-model
 * helpers shared by the mini-program pages (no `wx.*`, no Page()/Component().
 */

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
