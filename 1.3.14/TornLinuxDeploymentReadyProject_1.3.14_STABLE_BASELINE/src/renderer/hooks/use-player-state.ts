import { useEffect, useMemo, useState } from 'react';
import type { UnifiedPlayerState } from '@shared/types';

export function usePlayerState(refreshIntervalMs = 30000) {
  const [state, setState] = useState<UnifiedPlayerState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const next = await window.tornlinux?.getUnifiedState();
      if (!mounted || !next) return;
      setState(next);
      setLoading(false);
    };

    load().catch(() => {
      if (mounted) setLoading(false);
    });

    const timer = window.setInterval(() => {
      load().catch(() => undefined);
    }, refreshIntervalMs);

    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, [refreshIntervalMs]);

  return useMemo(() => ({ state, loading }), [state, loading]);
}
