import React from 'react';

export function FirstUseLanding({
  isOnline,
  hasTornApiKey,
  hasTornStatsApiKey,
  initialTornApiKey,
  initialTornStatsApiKey,
  onOpenNetworkSettings,
  onSaveApiKeys,
  onContinue,
}: {
  isOnline: boolean;
  hasTornApiKey: boolean;
  hasTornStatsApiKey: boolean;
  initialTornApiKey?: string;
  initialTornStatsApiKey?: string;
  onOpenNetworkSettings: () => void;
  onSaveApiKeys: (config: { tornApiKey: string; tornStatsApiKey: string }) => Promise<void>;
  onContinue: () => void;
}) {
  const [tornApiKey, setTornApiKey] = React.useState(initialTornApiKey || '');
  const [tornStatsApiKey, setTornStatsApiKey] = React.useState(initialTornStatsApiKey || '');
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState('');

  const save = async () => {
    setSaving(true);
    setMessage('');
    try {
      await onSaveApiKeys({
        tornApiKey,
        tornStatsApiKey,
      });
      setMessage('API keys saved');
    } catch {
      setMessage('Saving API keys failed');
    } finally {
      setSaving(false);
    }
  };

  const openNetwork = async () => {
    setMessage('');
    try {
      await Promise.resolve(onOpenNetworkSettings());
      setMessage('Opening network settings');
    } catch {
      setMessage('Network settings unavailable');
    }
  };

  return (
    <div className="tls-landingRoot">
      <div className="tls-landingCard">
        <div className="tls-landingEyebrow">First-use setup</div>
        <h1 className="tls-landingTitle">Prepare TornLinux</h1>
        <p className="tls-landingText">
          Confirm network access, add your Torn API key and TornStats read-only key, then continue into the live environment.
        </p>

        <div className="tls-landingSection">
          <div className="tls-landingLabel">Network</div>
          <div className="tls-landingRow">
            <span className={`tls-networkBadge ${isOnline ? 'is-online' : 'is-offline'}`}>
              {isOnline ? 'Online' : 'Offline'}
            </span>
            <button type="button" onClick={() => void openNetwork()}>Open Network Settings</button>
          </div>
        </div>

        <div className="tls-landingSection">
          <div className="tls-landingLabel">Torn API Key</div>
          <input
            type="password"
            className="tls-landingInput"
            value={tornApiKey}
            onChange={(e) => setTornApiKey(e.target.value)}
            placeholder="Enter Torn API key"
          />
        </div>

        <div className="tls-landingSection">
          <div className="tls-landingLabel">TornStats Read-Only Key</div>
          <input
            type="password"
            className="tls-landingInput"
            value={tornStatsApiKey}
            onChange={(e) => setTornStatsApiKey(e.target.value)}
            placeholder="Enter TornStats API key"
          />
          <div className="tls-landingRow">
            <button type="button" onClick={() => void save()} disabled={saving}>
              {saving ? 'Saving...' : (hasTornApiKey || hasTornStatsApiKey) ? 'Update API Keys' : 'Save API Keys'}
            </button>
          </div>
        </div>

        <div className="tls-landingActions">
          <button type="button" className="tls-landingContinue" onClick={onContinue}>Continue</button>
        </div>
        {message ? <div className="tls-installerNote">{message}</div> : null}
      </div>
    </div>
  );
}
