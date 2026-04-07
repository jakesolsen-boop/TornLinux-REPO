import React, { useEffect, useMemo, useState } from 'react';
import type { AppSettings } from '@shared/types';

function formatClock(date: Date, timezone: string) {
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }).format(date);
  } catch {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }).format(date);
  }
}

function IconNetwork() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="tlsbIcon">
      <path d="M12 18.5l2.2-2.1a3.1 3.1 0 00-4.4 0L12 18.5zm-4.8-4.7L9 15.6a5.6 5.6 0 016 0l1.8-1.8a8 8 0 00-9.6 0zm-3.4-3.4l1.8 1.8a10.8 10.8 0 0112.8 0l1.8-1.8a13.3 13.3 0 00-16.4 0z" fill="currentColor"/>
    </svg>
  );
}

function IconSound() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="tlsbIcon">
      <path d="M5 14h3l4 4V6L8 10H5v4zm10.5-2a4.5 4.5 0 00-2.5-4v8a4.5 4.5 0 002.5-4zm0-7v2a7 7 0 010 10v2a9 9 0 000-14z" fill="currentColor"/>
    </svg>
  );
}

export default function TornLinuxSystemBar({
  settings,
}: {
  settings: AppSettings;
}) {
  const [now, setNow] = useState(() => new Date());
  const [status, setStatus] = useState('');

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const tornUtc = useMemo(() => {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: 'UTC',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(now) + ' UTC';
  }, [now]);

  const localTime = useMemo(() => formatClock(now, settings.timezone || 'America/Chicago'), [now, settings.timezone]);

  const openSound = async () => {
    const result = await window.tornlinux?.launchSoundSettings?.();
    setStatus(result?.ok ? `Sound: ${result.method}` : 'Sound settings unavailable');
    setTimeout(() => setStatus(''), 2400);
  };

  const openNetwork = async () => {
    const result = await window.tornlinux?.launchNetworkSettings?.();
    setStatus(result?.ok ? `Network: ${result.method}` : 'Network settings unavailable');
    setTimeout(() => setStatus(''), 2400);
  };

  return (
    <div className="tlsbRoot" role="toolbar" aria-label="TornLinux system bar">
      <div className="tlsbLeft">{status ? <span className="tlsbStatus">{status}</span> : null}</div>
      <div className="tlsbCenter">
        <span className="tlsbLabel">TORN TIME</span>
        <span className="tlsbClock">{tornUtc}</span>
      </div>
      <div className="tlsbRight">
        <div className="tlsbLocalBlock">
          <span className="tlsbLabel">LOCAL</span>
          <span className="tlsbClock">{localTime}</span>
        </div>
        <button type="button" className="tlsbButton" onClick={openSound} aria-label="Open sound settings">
          <IconSound />
        </button>
        <button type="button" className="tlsbButton" onClick={openNetwork} aria-label="Open network settings">
          <IconNetwork />
        </button>
      </div>
    </div>
  );
}
