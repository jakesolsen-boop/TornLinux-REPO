import { useEffect, useState } from 'react';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);

  const refresh = async () => {
    try {
      const status = await window.tornlinux?.getNetworkStatus?.();
      setIsOnline(status?.connectivity === 'online');
      return status;
    } catch {
      setIsOnline(false);
      return { connectivity: 'offline' };
    }
  };

  useEffect(() => {
    void refresh();
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  return { isOnline, refresh };
}
