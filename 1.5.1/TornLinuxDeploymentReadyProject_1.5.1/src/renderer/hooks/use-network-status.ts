import { useCallback, useEffect, useMemo, useState } from 'react';
import type { NetworkStatus } from '@shared/types';

const FALLBACK_STATUS: NetworkStatus = {
  connectivity: 'offline',
  raw: 'unavailable',
};

export function useNetworkStatus() {
  const [status, setStatus] = useState<NetworkStatus>(FALLBACK_STATUS);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const next = await window.tornlinux?.getNetworkStatus?.();
      setStatus(next ?? FALLBACK_STATUS);
    } catch {
      setStatus(FALLBACK_STATUS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return useMemo(() => ({
    status,
    loading,
    isOnline: status.connectivity === 'online',
    refresh,
  }), [status, loading, refresh]);
}
