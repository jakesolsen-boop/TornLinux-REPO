import React, { useState } from 'react';

export function NetworkSetupGate({
  onOpenNetworkSettings,
  onRetry,
  onContinueOffline,
}: {
  onOpenNetworkSettings: () => Promise<void>;
  onRetry: () => Promise<void>;
  onContinueOffline: () => void;
}) {
  const [busy, setBusy] = useState<'open' | 'retry' | null>(null);

  const handleOpen = async () => {
    setBusy('open');
    try {
      await onOpenNetworkSettings();
    } finally {
      setBusy(null);
    }
  };

  const handleRetry = async () => {
    setBusy('retry');
    try {
      await onRetry();
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="tlnGate" role="dialog" aria-modal="true" aria-labelledby="tlnGateTitle">
      <div className="tlnGatePanel">
        <div className="tlnGateEyebrow">System State</div>
        <h2 id="tlnGateTitle" className="tlnGateTitle">Connect to the Internet</h2>
        <p className="tlnGateBody">
          TornLinux requires a network connection for player data, API access, and service connectivity.
        </p>

        <div className="tlnGateActions">
          <button type="button" className="tlnGateButton tlnGateButton--primary" onClick={() => void handleOpen()} disabled={busy !== null}>
            {busy === 'open' ? 'Opening...' : 'Open Network Settings'}
          </button>
          <button type="button" className="tlnGateButton tlnGateButton--secondary" onClick={() => void handleRetry()} disabled={busy !== null}>
            {busy === 'retry' ? 'Retrying...' : 'Retry'}
          </button>
          <button type="button" className="tlnGateButton tlnGateButton--ghost" onClick={onContinueOffline} disabled={busy !== null}>
            Continue Offline
          </button>
        </div>
      </div>
    </div>
  );
}
