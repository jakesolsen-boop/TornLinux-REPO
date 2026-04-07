import React from 'react';

export function EntryScreen({
  initialMode,
  onRunLive,
  onInstall,
}: {
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
      </div>
    </div>
  );
}
