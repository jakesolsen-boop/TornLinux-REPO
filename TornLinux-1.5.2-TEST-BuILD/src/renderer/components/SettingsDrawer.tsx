import React, { useEffect, useState } from 'react';
import type { AppConfig, AppSettings, DisplayState, PowerAction } from '@shared/types';

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
  const [displayState, setDisplayState] = useState<DisplayState | null>(null);
  const [displayBusy, setDisplayBusy] = useState('');
  const [powerBusy, setPowerBusy] = useState<PowerAction | ''>('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setForm(currentSettings);
  }, [currentSettings]);

  useEffect(() => {
    if (!open) return;
    window.tornlinux?.getSystemVolume?.().then((v: number) => setVolume(v)).catch(() => undefined);
    window.tornlinux?.getConfig?.().then((value: AppConfig) => setConfig(value || {})).catch(() => undefined);
    window.tornlinux?.getDisplayState?.().then((value: DisplayState | null) => setDisplayState(value || null)).catch(() => undefined);
  }, [open]);

  const changeVolume = async (v: number) => {
    setVolume(v);
    try {
      const nextVolume = await window.tornlinux?.setSystemVolume?.(v);
      if (typeof nextVolume === 'number') setVolume(nextVolume);
    } catch {
      setMessage('Volume change failed');
    }
  };

  const applyDisplayMode = async (mode: string) => {
    setDisplayBusy(mode);
    try {
      const result = await window.tornlinux?.setDisplayMode?.(mode);
      const nextState = await window.tornlinux?.getDisplayState?.();
      setDisplayState(nextState || null);
      setMessage(result?.ok ? `Resolution set to ${mode}` : 'Resolution change failed');
    } catch {
      setMessage('Resolution change failed');
    } finally {
      setDisplayBusy('');
    }
  };

  const runPowerAction = async (action: PowerAction) => {
    setPowerBusy(action);
    try {
      const result = await window.tornlinux?.powerAction?.(action);
      setMessage(result?.ok ? `${action} started` : `${action} unavailable`);
    } catch {
      setMessage(`${action} unavailable`);
    } finally {
      setPowerBusy('');
    }
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
            onChange={(e) => setConfig((current: AppConfig) => ({ ...current, tornApiKey: e.target.value }))}
            placeholder="Enter Torn API key"
          />
        </div>

        <div className="tsd-section">
          <label>TornStats Read-Only Key</label>
          <input
            type="password"
            value={config.tornStatsApiKey || ''}
            onChange={(e) => setConfig((current: AppConfig) => ({ ...current, tornStatsApiKey: e.target.value }))}
            placeholder="Enter TornStats API key"
          />
        </div>

        <div className="tsd-section">
          <label>Layout mode</label>
          <select
            value={form.layoutMode}
            onChange={(e) => setForm((current: AppSettings) => ({ ...current, layoutMode: e.target.value as AppSettings['layoutMode'] }))}
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
            onChange={(e) => setForm((current: AppSettings) => ({ ...current, refreshIntervalMs: Number(e.target.value) }))}
          />
        </div>

        <div className="tsd-section">
          <label>Discord width</label>
          <input
            type="number"
            min={340}
            max={900}
            value={form.discordWidth}
            onChange={(e) => setForm((current: AppSettings) => ({ ...current, discordWidth: Number(e.target.value) }))}
          />
        </div>

        <div className="tsd-section">
          <label>Torn URL</label>
          <input
            type="text"
            value={form.tornUrl}
            onChange={(e) => setForm((current: AppSettings) => ({ ...current, tornUrl: e.target.value }))}
          />
        </div>

        <div className="tsd-section">
          <label>Discord URL</label>
          <input
            type="text"
            value={form.discordUrl}
            onChange={(e) => setForm((current: AppSettings) => ({ ...current, discordUrl: e.target.value }))}
          />
        </div>

        <div className="tsd-section">
          <label>Timezone</label>
          <input
            type="text"
            value={form.timezone}
            onChange={(e) => setForm((current: AppSettings) => ({ ...current, timezone: e.target.value }))}
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

        <div className="tsd-section">
          <label>Display Resolution</label>
          {displayState?.modes?.length ? (
            <div className="tsd-actionGrid">
              {displayState.modes.map((mode: string) => (
                <button
                  key={mode}
                  type="button"
                  className={`tsd-actionButton ${displayState.currentMode === mode ? 'is-current' : ''}`}
                  onClick={() => void applyDisplayMode(mode)}
                  disabled={displayBusy === mode}
                >
                  <span>{mode}</span>
                  {displayState.currentMode === mode ? <strong>Current</strong> : null}
                </button>
              ))}
            </div>
          ) : (
            <div className="tsd-inlineMessage">No display modes available.</div>
          )}
        </div>

        <div className="tsd-section">
          <label>Power</label>
          <div className="tsd-actionGrid">
            <button type="button" className="tsd-actionButton" onClick={() => void runPowerAction('reload')} disabled={powerBusy === 'reload'}>
              <span>Reload</span>
              <strong>Refresh app shell</strong>
            </button>
            <button type="button" className="tsd-actionButton" onClick={() => void runPowerAction('restart')} disabled={powerBusy === 'restart'}>
              <span>Restart</span>
              <strong>Reboot system</strong>
            </button>
            <button type="button" className="tsd-actionButton is-danger" onClick={() => void runPowerAction('shutdown')} disabled={powerBusy === 'shutdown'}>
              <span>Shutdown</span>
              <strong>Power off system</strong>
            </button>
          </div>
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
