import React, { useEffect, useMemo, useState } from 'react';
import type { AppSettings } from '@shared/types';

function formatClock(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(date);
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

  const localTime = useMemo(() => formatClock(now), [now]);
  void settings;

  return (
    <div className="tlsbRoot" role="toolbar" aria-label="TornLinux system bar">
      <div className="tlsbLeft">{status ? <span className="tlsbStatus">{status}</span> : null}</div>
      <div className="tlsbCenter" />
      <div className="tlsbRight">
        <div className="tlsbLocalBlock">
          <span className="tlsbLabel">LOCAL</span>
          <span className="tlsbClock">{localTime}</span>
        </div>
      </div>
    </div>
  );
}
