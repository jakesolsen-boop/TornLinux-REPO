import React from 'react';

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
  onOpenNetworkSettings: () => void;
  onSaveApiKey: (apiKey: string) => Promise<void>;
  onContinue: () => void;
}) {
  const [apiKey, setApiKey] = React.useState(initialApiKey || '');
  const [saving, setSaving] = React.useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await onSaveApiKey(apiKey);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="tls-landingRoot">
      <div className="tls-landingCard">
        <div className="tls-landingEyebrow">First-use setup</div>
        <h1 className="tls-landingTitle">Prepare TornLinux</h1>
        <p className="tls-landingText">
          Confirm network access, add your Torn API key if available, then continue into the live environment.
        </p>

        <div className="tls-landingSection">
          <div className="tls-landingLabel">Network</div>
          <div className="tls-landingRow">
            <span className={`tls-networkBadge ${isOnline ? 'is-online' : 'is-offline'}`}>
              {isOnline ? 'Online' : 'Offline'}
            </span>
            <button type="button" onClick={onOpenNetworkSettings}>Open Network Settings</button>
          </div>
        </div>

        <div className="tls-landingSection">
          <div className="tls-landingLabel">Torn API Key</div>
          <input
            type="password"
            className="tls-landingInput"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter Torn API key"
          />
          <div className="tls-landingRow">
            <button type="button" onClick={() => void save()} disabled={saving}>
              {saving ? 'Saving...' : hasApiKey ? 'Update API Key' : 'Save API Key'}
            </button>
          </div>
        </div>

        <div className="tls-landingActions">
          <button type="button" className="tls-landingContinue" onClick={onContinue}>Continue</button>
        </div>
      </div>
    </div>
  );
}
