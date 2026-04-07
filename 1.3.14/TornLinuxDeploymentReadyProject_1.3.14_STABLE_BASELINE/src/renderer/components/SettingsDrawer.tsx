import React, { useEffect, useState } from 'react';
import type { AppSettings } from '@shared/types';

export function SettingsDrawer({ open, currentSettings, onClose, onSaved }: { open: boolean; currentSettings: AppSettings; onClose: () => void; onSaved?: () => void; }) {
  const [form, setForm] = useState(currentSettings);
  const [config, setConfig] = useState({ tornApiKey: '' });
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

  const save = async () => {
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
      await window.tornlinux?.saveConfig({ tornApiKey: String(config.tornApiKey || '').trim() });
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
          <label>Refresh interval (ms)</label>
          <input type="number" min="30000" step="1000" value={form.refreshIntervalMs} onChange={(e) => setForm({ ...form, refreshIntervalMs: Number(e.target.value) })} />
        </div>

        <div className="tsd-section">
          <label>Torn URL</label>
          <input type="text" value={form.tornUrl} onChange={(e) => setForm({ ...form, tornUrl: e.target.value })} />
        </div>

        <div className="tsd-section">
          <label>Discord URL</label>
          <input type="text" value={form.discordUrl} onChange={(e) => setForm({ ...form, discordUrl: e.target.value })} />
        </div>

        <div className="tsd-section">
          <label>Discord width</label>
          <input type="number" min="340" max="640" value={form.discordWidth} onChange={(e) => setForm({ ...form, discordWidth: Number(e.target.value) })} />
        </div>

        <footer className="tsd-footer">
          <button type="button" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
          {message ? <span>{message}</span> : null}
        </footer>
      </aside>
    </div>
  );
}
