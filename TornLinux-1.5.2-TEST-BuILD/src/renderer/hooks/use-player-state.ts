import { useCallback, useEffect, useMemo, useState } from 'react';
import type { UnifiedPlayerState } from '@shared/types';

export function usePlayerState(refreshIntervalMs = 30000) {
  const [state, setState] = useState<UnifiedPlayerState | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const next = await window.tornlinux?.getUnifiedState();
    if (!next) return null;
    setState(next);
    setLoading(false);
    return next;
  }, []);

  useEffect(() => {
    let mounted = true;

    refresh().catch(() => {
      if (mounted) setLoading(false);
    });

    const timer = window.setInterval(() => {
      refresh().catch(() => undefined);
    }, refreshIntervalMs);

    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, [refresh, refreshIntervalMs]);

  return useMemo(() => ({ state, loading, refresh }), [loading, refresh, state]);
}
