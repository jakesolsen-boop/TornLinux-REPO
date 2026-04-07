import React, { useEffect, useState } from 'react';
import type { AppConfig, AppSettings } from '@shared/types';

type Props = {
  open: boolean;
  currentSettings: AppSettings;
  networkOnline: boolean;
  onClose: () => void;
  onOpenNetworkSettings: () => void;
  onOpenBluetoothSettings: () => void;
  onSaved?: () => void;
};

export function SettingsDrawer({
  open,
  currentSettings,
  networkOnline,
  onClose,
  onOpenNetworkSettings,
  onOpenBluetoothSettings,
  onSaved,
}: Props) {
  const [volume, setVolume] = useState(50);
  const [form, setForm] = useState(currentSettings);
  const [config, setConfig] = useState<AppConfig>({ tornApiKey: '', tornStatsApiKey: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setForm(currentSettings);
  }, [currentSettings]);

  useEffect(() => {
    if (!open) return;
    window.tornlinux?.getSystemVolume?.().then((v: number) => setVolume(v)).catch(() => undefined);
    window.tornlinux?.getConfig?.().then((value) => setConfig(value || {})).catch(() => undefined);
  }, [open]);

  const changeVolume = async (v: number) => {
    setVolume(v);
    await window.tornlinux?.setSystemVolume?.(v);
  };

  const save = async () => {
    setSaving(true);
    setMessage('');
    try {
      await window.tornlinux?.setSettings({
        ...currentSettings,
        ...form,
        discordWidth: Number(form.discordWidth),
        refreshIntervalMs: Number(form.refreshIntervalMs),
      });
      await window.tornlinux?.saveConfig({
        tornApiKey: String(config.tornApiKey || '').trim(),
        tornStatsApiKey: String(config.tornStatsApiKey || '').trim(),
      });
      setMessage('Settings saved');
      onSaved?.();
    } catch {
      setMessage('Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="tsd-backdrop" role="presentation">
      <aside className="tsd-panel" aria-label="Settings drawer">
        <div className="tsd-header">
          <div>
            <strong>Settings</strong>
            <span>{networkOnline ? 'Network online' : 'Network offline'}</span>
          </div>
          <button type="button" onClick={onClose}>Close</button>
        </div>

        <div className="tsd-section">
          <label>Torn API Key</label>
          <input
            type="password"
            value={config.tornApiKey || ''}
            onChange={(e) => setConfig((current) => ({ ...current, tornApiKey: e.target.value }))}
            placeholder="Enter Torn API key"
          />
        </div>

        <div className="tsd-section">
          <label>TornStats Read-Only Key</label>
          <input
            type="password"
            value={config.tornStatsApiKey || ''}
            onChange={(e) => setConfig((current) => ({ ...current, tornStatsApiKey: e.target.value }))}
            placeholder="Enter TornStats API key"
          />
        </div>

        <div className="tsd-section">
          <label>Layout mode</label>
          <select
            value={form.layoutMode}
            onChange={(e) => setForm((current) => ({ ...current, layoutMode: e.target.value as AppSettings['layoutMode'] }))}
          >
            <option value="torn">Torn only</option>
            <option value="split">Split view</option>
          </select>
        </div>

        <div className="tsd-section">
          <label>Refresh interval (ms)</label>
          <input
            type="number"
            min={5000}
            step={1000}
            value={form.refreshIntervalMs}
            onChange={(e) => setForm((current) => ({ ...current, refreshIntervalMs: Number(e.target.value) }))}
          />
        </div>

        <div className="tsd-section">
          <label>Discord width</label>
          <input
            type="number"
            min={340}
            max={900}
            value={form.discordWidth}
            onChange={(e) => setForm((current) => ({ ...current, discordWidth: Number(e.target.value) }))}
          />
        </div>

        <div className="tsd-section">
          <label>Torn URL</label>
          <input
            type="text"
            value={form.tornUrl}
            onChange={(e) => setForm((current) => ({ ...current, tornUrl: e.target.value }))}
          />
        </div>

        <div className="tsd-section">
          <label>Discord URL</label>
          <input
            type="text"
            value={form.discordUrl}
            onChange={(e) => setForm((current) => ({ ...current, discordUrl: e.target.value }))}
          />
        </div>

        <div className="tsd-section">
          <label>Timezone</label>
          <input
            type="text"
            value={form.timezone}
            onChange={(e) => setForm((current) => ({ ...current, timezone: e.target.value }))}
            placeholder="America/Chicago"
          />
        </div>

        <div className="tsd-section">
          <label>Volume</label>
          <input
            type="range"
            min={0}
            max={100}
            value={volume}
            onChange={(e) => changeVolume(Number(e.target.value))}
          />
        </div>

        <div className="tsd-footer">
          <button type="button" onClick={onOpenNetworkSettings}>Network Settings</button>
          <button type="button" onClick={onOpenBluetoothSettings}>Bluetooth Settings</button>
          <button type="button" onClick={() => void save()} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
        </div>

        {message ? <div className="tsd-message">{message}</div> : null}
      </aside>
    </div>
  );
}
