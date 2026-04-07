import React, { useEffect, useState } from 'react';
import type { AppSettings } from '@shared/types';

export function SettingsDrawer({
  open,
  currentSettings,
  onClose,
  onSaved,
  onOpenNetworkSettings,
  onOpenBluetoothSettings,
  networkOnline,
}: {
  open: boolean;
  currentSettings: AppSettings;
  onClose: () => void;
  onSaved?: () => void;
  onOpenNetworkSettings?: () => Promise<void>;
  onOpenBluetoothSettings?: () => Promise<void>;
  networkOnline?: boolean;
}) {
  const [form, setForm] = useState(currentSettings);
  const [config, setConfig] = useState({ tornApiKey: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [networkMessage, setNetworkMessage] = useState('');
  const [volume, setVolume] = useState(50);
  const [volumeMessage, setVolumeMessage] = useState('');

  useEffect(() => {
    setForm(currentSettings);
  }, [currentSettings]);

  useEffect(() => {
    if (!open) return;
    window.tornlinux?.getConfig().then((value) => setConfig(value)).catch(() => undefined);
    window.tornlinux?.getSystemVolume?.().then((value) => {
      if (typeof value === 'number') setVolume(value);
    }).catch(() => undefined);
  }, [open]);

  if (!open) return null;

  const openNetworkSettings = async () => {
    setNetworkMessage('');
    try {
      await onOpenNetworkSettings?.();
      setNetworkMessage('Network settings opened');
    } catch {
      setNetworkMessage('Network settings unavailable');
    }
  };

  const openBluetoothSettings = async () => {
    setVolumeMessage('');
    try {
      await onOpenBluetoothSettings?.();
      setVolumeMessage('Bluetooth controls opened');
    } catch {
      setVolumeMessage('Bluetooth unavailable');
    }
  };

  const updateVolume = async (value: number) => {
    setVolume(value);
    try {
      const applied = await window.tornlinux?.setSystemVolume?.(value);
      if (typeof applied === 'number') setVolume(applied);
    } catch {
      setVolumeMessage('Volume control unavailable');
    }
  };

  const save = async () => {
    setSaving(true);
    setMessage('');
    try {
      await window.tornlinux?.setSettings({
        layoutMode: form.layoutMode,
      });
      await window.tornlinux?.saveConfig({
        tornApiKey: String(config.tornApiKey || '').trim(),
        seededBuildVersion: '1.4.0',
      });
      setMessage('Saved');
      onSaved?.();
    } catch {
      setMessage('Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="tsd-backdrop" onClick={onClose} role="presentation">
      <aside className="tsd-panel" onClick={(event) => event.stopPropagation()} aria-label="Settings drawer">
        <header className="tsd-header">
          <div><strong>Settings</strong><span>TornLinux configuration</span></div>
          <button type="button" onClick={onClose}>Close</button>
        </header>

        <div className="tsd-section">
          <label>Torn API Key</label>
          <input type="password" value={config.tornApiKey} onChange={(e) => setConfig({ tornApiKey: e.target.value })} placeholder="Enter Torn API key" />
        </div>

        <div className="tsd-section">
          <label>Layout mode</label>
          <div className="tsd-toggleRow" role="group" aria-label="Layout mode">
            <button type="button" className={`tsd-toggle ${form.layoutMode === 'torn' ? 'is-active' : ''}`} onClick={() => setForm({ ...form, layoutMode: 'torn' })}>Focused</button>
            <button type="button" className={`tsd-toggle ${form.layoutMode === 'split' ? 'is-active' : ''}`} onClick={() => setForm({ ...form, layoutMode: 'split' })}>Split</button>
          </div>
        </div>

        <div className="tsd-section">
          <label>Network</label>
          <div className="tsd-networkRow">
            <span className={`tsd-networkBadge ${networkOnline ? 'is-online' : 'is-offline'}`}>{networkOnline ? 'Online' : 'Offline'}</span>
            <button type="button" onClick={openNetworkSettings}>Open Network Settings</button>
          </div>
          {networkMessage ? <span className="tsd-inlineMessage">{networkMessage}</span> : null}
        </div>

        <div className="tsd-section">
          <label>Audio</label>
          <div className="tsd-audioRow">
            <input
              className="tsd-volumeSlider"
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => void updateVolume(Number(e.target.value))}
              aria-label="System volume"
            />
            <span className="tsd-volumeValue">{volume}%</span>
            <button
              type="button"
              className="tsd-btButton"
              onClick={openBluetoothSettings}
              aria-label="Bluetooth"
              title="Bluetooth"
            >
              🎧
            </button>
          </div>
          {volumeMessage ? <span className="tsd-inlineMessage">{volumeMessage}</span> : null}
        </div>

        <footer className="tsd-footer">
          <button type="button" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
          {message ? <span>{message}</span> : null}
        </footer>
      </aside>
    </div>
  );
}
