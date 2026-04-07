import { useEffect, useMemo, useState, useCallback } from 'react';
import type { UnifiedPlayerState } from '@shared/types';

export function usePlayerState(refreshIntervalMs = 30000) {
  const [state, setState] = useState<UnifiedPlayerState | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const next = await window.tornlinux?.getUnifiedState();
    if (!next) return;
    setState(next);
    setLoading(false);
  }, []);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const next = await window.tornlinux?.getUnifiedState();
        if (!mounted || !next) return;
        setState(next);
        setLoading(false);
      } catch {
        if (mounted) setLoading(false);
      }
    };
    void load();
    const timer = window.setInterval(() => { void load(); }, refreshIntervalMs);
    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, [refreshIntervalMs]);

  return useMemo(() => ({ state, loading, refresh }), [state, loading, refresh]);
}
