import { useCallback, useEffect, useRef, useState } from 'react';

export type AsyncData<T> =
  | { state: 'loading' }
  | { state: 'error'; retry: () => void }
  | { state: 'ready'; data: T };

/**
 * Minimal async data hook backing the five mandatory UI states: consumers map
 * `loading` / `error` / `ready` onto `ScreenState`. Loaders must be stable or
 * provided via deps; the hook ignores results of stale loads.
 */
export function useAsyncData<T>(loader: () => Promise<T>, deps: readonly unknown[]): AsyncData<T> {
  const [snapshot, setSnapshot] = useState<AsyncData<T>>({ state: 'loading' });
  const loadSeq = useRef(0);

  const load = useCallback(() => {
    const seq = loadSeq.current + 1;
    loadSeq.current = seq;
    setSnapshot({ state: 'loading' });
    loader().then(
      (data) => {
        if (loadSeq.current === seq) {
          setSnapshot({ state: 'ready', data });
        }
      },
      () => {
        if (loadSeq.current === seq) {
          setSnapshot({ state: 'error', retry: load });
        }
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    load();
  }, [load]);

  return snapshot;
}
