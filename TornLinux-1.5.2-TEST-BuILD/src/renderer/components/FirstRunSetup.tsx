import React, { useEffect, useState } from 'react';
import type { AppConfig, AppSettings } from '@shared/types';

const SETUP_KEY = 'tornlinux.firstRunComplete';

export function FirstRunSetup({
  open,
  currentSettings,
  configStatus,
  onComplete,
}: {
  open: boolean;
  currentSettings: AppSettings;
  configStatus: { hasTornApiKey: boolean; hasTornStatsApiKey: boolean };
  onComplete?: () => void;
}) {
  const [form, setForm] = useState(currentSettings);
  const [config, setConfig] = useState<AppConfig>({ tornApiKey: '', tornStatsApiKey: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setForm(currentSettings);
  }, [currentSettings]);

  useEffect(() => {
    if (!open) return;
    window.tornlinux?.getConfig().then((value) => setConfig(value)).catch(() => undefined);
  }, [open]);

  if (!open) return null;

  const finish = async () => {
    setSaving(true);
    setMessage('');
    try {
      await window.tornlinux?.setSettings({
        refreshIntervalMs: Number(form.refreshIntervalMs),
        tornUrl: form.tornUrl,
        discordUrl: form.discordUrl,
        discordWidth: Number(form.discordWidth),
        timezone: form.timezone,
      });
      await window.tornlinux?.saveConfig({
        tornApiKey: String(config.tornApiKey || '').trim(),
        tornStatsApiKey: String(config.tornStatsApiKey || '').trim(),
      });
      localStorage.setItem(SETUP_KEY, 'true');
      localStorage.setItem('tornlinux.firstRunSentinel', 'true');
      setMessage('Command center primed');
      onComplete?.();
    } catch {
      setMessage('Setup save failed');
    } finally {
      setSaving(false);
    }
  };

  const skip = () => {
    localStorage.setItem(SETUP_KEY, 'true');
    localStorage.setItem('tornlinux.firstRunSentinel', 'true');
    onComplete?.();
  };

  return (
    <div className="tfs-backdrop" role="presentation">
      <section className="tfs-panel" aria-label="First run setup">
        <div className="tfs-kicker">TORNLINUX 1.5.2</div>
        <h1>Initialize command center</h1>
        <p className="tfs-copy">
          Set your core connections now so the first launch feels like a launch instead of a wiring closet.
        </p>

        <div className="tfs-grid">
          <div className="tfs-section">
            <label>Torn API Key</label>
            <input
              type="password"
              value={config.tornApiKey}
              onChange={(e) => setConfig((current) => ({ ...current, tornApiKey: e.target.value }))}
              placeholder="Enter Torn API key"
            />
            <span>{configStatus.hasTornApiKey ? 'Torn API key detected. You can replace it here.' : 'Add your Torn API key now or skip and configure later.'}</span>
          </div>

          <div className="tfs-section">
            <label>TornStats Read-Only Key</label>
            <input
              type="password"
              value={config.tornStatsApiKey}
              onChange={(e) => setConfig((current) => ({ ...current, tornStatsApiKey: e.target.value }))}
              placeholder="Enter TornStats API key"
            />
            <span>{configStatus.hasTornStatsApiKey ? 'TornStats key detected. You can replace it here.' : 'Add a TornStats read-only key now or configure it later.'}</span>
          </div>

          <div className="tfs-section">
            <label>Layout mode</label>
            <div className="tfs-toggleRow">
              <button type="button" className={form.layoutMode === 'torn' ? 'is-active' : ''} onClick={() => setForm({ ...form, layoutMode: 'torn' })}>Torn only</button>
              <button type="button" className={form.layoutMode === 'split' ? 'is-active' : ''} onClick={() => setForm({ ...form, layoutMode: 'split' })}>Split view</button>
            </div>
            <span>Choose whether Discord launches beside Torn by default.</span>
          </div>

          <div className="tfs-section">
            <label>Refresh interval (ms)</label>
            <input
              type="number"
              min="30000"
              step="1000"
              value={form.refreshIntervalMs}
              onChange={(e) => setForm({ ...form, refreshIntervalMs: Number(e.target.value) })}
            />
          </div>

          <div className="tfs-section">
            <label>Discord width</label>
            <input
              type="number"
              min="340"
              max="640"
              value={form.discordWidth}
              onChange={(e) => setForm({ ...form, discordWidth: Number(e.target.value) })}
            />
          </div>

          <div className="tfs-section">
            <label>Torn URL</label>
            <input
              type="text"
              value={form.tornUrl}
              onChange={(e) => setForm({ ...form, tornUrl: e.target.value })}
            />
          </div>


          <div className="tfs-section">
            <label>Local timezone</label>
            <input
              type="text"
              value={form.timezone}
              onChange={(e) => setForm({ ...form, timezone: e.target.value })}
              placeholder="America/Chicago"
            />
            <span>Used for the local clock in the TornLinux system bar.</span>
          </div>

          <div className="tfs-section">
            <label>Discord URL</label>
            <input
              type="text"
              value={form.discordUrl}
              onChange={(e) => setForm({ ...form, discordUrl: e.target.value })}
            />
          </div>
        </div>

        <div className="tfs-footer">
          <button type="button" className="tfs-secondary" onClick={skip}>Skip for now</button>
          <button type="button" className="tfs-primary" onClick={finish} disabled={saving}>{saving ? 'Saving...' : 'Start TornLinux'}</button>
        </div>

        {message ? <div className="tfs-message">{message}</div> : null}
      </section>
    </div>
  );
}
