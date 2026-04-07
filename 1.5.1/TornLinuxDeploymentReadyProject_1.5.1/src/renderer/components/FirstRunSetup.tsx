import React, { useEffect, useState } from 'react';

export function FirstRunSetup({
  open,
  initialApiKey,
  onSave,
  onClose,
}: {
  open: boolean;
  initialApiKey?: string;
  onSave: (key: string) => Promise<void>;
  onClose: () => void;
}) {
  const [apiKey, setApiKey] = useState(initialApiKey ?? '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (open) {
      setApiKey(initialApiKey ?? '');
      setMessage('');
    }
  }, [open, initialApiKey]);

  if (!open) return null;

  const save = async () => {
    setSaving(true);
    setMessage('');
    try {
      await onSave(apiKey);
      setMessage('API key saved');
      onClose();
    } catch {
      setMessage('API save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="tfs-backdrop" role="presentation">
      <section className="tfs-panel" aria-label="API key required">
        <div className="tfs-kicker">System State</div>
        <h1>Enter Torn API Key</h1>
        <p className="tfs-copy">
          TornLinux requires an API key to load player data and system state.
        </p>

        <div className="tfs-grid">
          <div className="tfs-section">
            <label>API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter API key"
            />
            <span>Save a valid key to refresh the header and load player state immediately.</span>
          </div>
        </div>

        <footer className="tfs-footer">
          <button type="button" className="tfs-save" onClick={save} disabled={saving || !apiKey.trim()}>
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button type="button" className="tfs-skip" onClick={onClose} disabled={saving}>
            Continue Offline
          </button>
          {message ? <span className="tfs-inlineMessage">{message}</span> : null}
        </footer>
      </section>
    </div>
  );
}
