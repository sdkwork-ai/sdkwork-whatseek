/**
 * Session gate: guarantees a session exists before rendering the shell. The
 * standalone milestone auto-creates a visitor session (mock 用户体系); Phase 2
 * replaces the body with the IAM login integration.
 */

import type { ReactNode } from 'react';

import { useEffect } from 'react';

import { useSessionStore } from '@sdkwork/whatseek-pc-core';

export function AuthGate({ children }: { children: ReactNode }) {
  const user = useSessionStore((state) => state.user);
  const ensureVisitor = useSessionStore((state) => state.ensureVisitor);

  useEffect(() => {
    ensureVisitor();
  }, [ensureVisitor]);

  if (user === null) {
    return null;
  }
  return <>{children}</>;
}
