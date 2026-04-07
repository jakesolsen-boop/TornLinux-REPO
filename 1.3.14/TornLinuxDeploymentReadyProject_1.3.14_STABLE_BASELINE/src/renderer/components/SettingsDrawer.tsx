import React, { useEffect, useState } from 'react';

export function SettingsDrawer({ open, onClose, onOpenNetworkSettings, onOpenBluetoothSettings }: any) {
  const [volume, setVolume] = useState(50);

  useEffect(() => {
    if (open) {
      window.tornlinux?.getSystemVolume?.().then((v: number) => setVolume(v));
    }
  }, [open]);

  const changeVolume = async (v: number) => {
    setVolume(v);
    await window.tornlinux?.setSystemVolume?.(v);
  };

  if (!open) return null;

  return (
    <div className="tl-settingsDrawer">
      <div className="tl-settingsPanel">
        <h2>Settings</h2>

        <div className="tl-setting">
          <label>Volume</label>
          <input
            type="range"
            min={0}
            max={100}
            value={volume}
            onChange={(e) => changeVolume(Number(e.target.value))}
          />
        </div>

        <div className="tl-setting">
          <button onClick={onOpenNetworkSettings}>Network Settings</button>
        </div>

        <div className="tl-setting">
          <button onClick={onOpenBluetoothSettings}>Bluetooth Settings</button>
        </div>

        <div className="tl-setting">
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
