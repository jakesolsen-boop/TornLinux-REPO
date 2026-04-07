import React, { useEffect, useState } from 'react';

export function TornLinuxHeader({ player, networkOnline, onToggleTornStats, onOpenNetworkSettings, onOpenSettings }: any) {
  const [time, setTime] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const utc = now.toUTCString().split(' ')[4];
      setTime(utc);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="tl-header">
      <div className="tl-header-left">
        <div className="tl-header-title">TornLinux</div>
        <div className="tl-header-player">{player.name} (Lvl {player.level})</div>
      </div>

      <div className="tl-header-center">
        <div className="tl-header-clock">UTC {time}</div>
      </div>

      <div className="tl-header-right">
        <button onClick={onOpenNetworkSettings} className={`tl-net ${networkOnline ? 'online' : 'offline'}`}>
          {networkOnline ? 'Online' : 'Offline'}
        </button>
        <button onClick={onToggleTornStats}>Stats</button>
        <button onClick={onOpenSettings}>Settings</button>
      </div>
    </div>
  );
}
