import React from 'react';

export function EntryScreen({
  version,
  initialMode,
  onRunLive,
  onInstall,
}: {
  version: string;
  initialMode: 'live' | 'install';
  onRunLive: () => void;
  onInstall: () => void;
}) {
  return (
    <div className="tls-entryRoot">
      <div className="tls-entryCard">
        <div className="tls-entryEyebrow">TornLinux boot selector</div>
        <h1 className="tls-entryTitle">Choose how to continue</h1>
        <p className="tls-entryText">
          Start TornLinux in the live environment, or launch the installer to deploy it to disk.
        </p>

        <div className="tls-entryInfo">
          <strong>Persistence</strong>
          <p>
            Persistence keeps your TornLinux settings, API keys, and other live-session data on a writable USB
            persistence partition so they survive reboot. Without persistence, live mode resets to a clean state every
            time.
          </p>
          <p>
            Persistence is temporarily disabled in this dracut validation build while the USB overlay path is being
            rebuilt.
          </p>
        </div>

        <div className="tls-entryActions">
          <button
            type="button"
            className={`tls-entryButton ${initialMode === 'live' ? 'is-primary' : ''}`}
            onClick={onRunLive}
          >
            Run Live
          </button>
          <button
            type="button"
            className={`tls-entryButton ${initialMode === 'install' ? 'is-primary' : ''}`}
            onClick={onInstall}
          >
            Install TornLinux
          </button>
        </div>

        <div className="tls-entryStamp">{version}</div>
      </div>
    </div>
  );
}
