import React, { useEffect, useState } from 'react';
import '../styles/landing-screen.css';

export function FirstUseLanding({
  isOnline,
  hasApiKey,
  initialApiKey,
  onOpenNetworkSettings,
  onSaveApiKey,
  onContinue,
}: {
  isOnline: boolean;
  hasApiKey: boolean;
  initialApiKey?: string;
  onOpenNetworkSettings: () => Promise<void>;
  onSaveApiKey: (key: string) => Promise<void>;
  onContinue: () => void;
}) {
  const [apiKey, setApiKey] = useState(initialApiKey ?? '');
  const [busy, setBusy] = useState<'network' | 'save' | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setApiKey(initialApiKey ?? '');
  }, [initialApiKey]);

  const openNetwork = async () => {
    setBusy('network');
    setMessage('');
    try {
      await onOpenNetworkSettings();
    } finally {
      setBusy(null);
    }
  };

  const saveApiKey = async () => {
    setBusy('save');
    setMessage('');
    try {
      await onSaveApiKey(apiKey);
      setMessage('API key saved');
    } catch {
      setMessage('API save failed');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="tllRoot">
      <div className="tllPanel">
        <div className="tllKicker">System Ready</div>
        <h1 className="tllTitle">Prepare TornLinux</h1>
        <p className="tllBody">
          Establish network and API state before entering the command center.
        </p>

        <div className="tllStatusGrid">
          <div className={`tllStatusCard ${isOnline ? 'is-online' : 'is-offline'}`}>
            <span className="tllStatusLabel">Network</span>
            <strong>{isOnline ? 'Connected' : 'Not Connected'}</strong>
            <button type="button" onClick={() => void openNetwork()} disabled={busy !== null}>
              {busy === 'network' ? 'Opening...' : 'Connect Network'}
            </button>
          </div>

          <div className={`tllStatusCard ${hasApiKey ? 'is-online' : 'is-offline'}`}>
            <span className="tllStatusLabel">API Key</span>
            <strong>{hasApiKey ? 'Configured' : 'Missing'}</strong>
            <input
              type="password"
              value={apiKey}
              onChange={(event) => setApiKey(event.target.value)}
              placeholder="Enter API key"
            />
            <button type="button" onClick={() => void saveApiKey()} disabled={busy !== null || !apiKey.trim()}>
              {busy === 'save' ? 'Saving...' : 'Save API Key'}
            </button>
          </div>
        </div>

        {message ? <div className="tllMessage">{message}</div> : null}

        <div className="tllActions">
          <button type="button" className="tllContinue" onClick={onContinue}>
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
