import React, { useState } from 'react';
import '../styles/installer-screen.css';

export function InstallerScreen({
  onLaunchInstaller,
  onBack,
}: {
  onLaunchInstaller: () => Promise<{ ok?: boolean; method?: string } | void>;
  onBack: () => void;
}) {
  const [message, setMessage] = useState('');
  const [launching, setLaunching] = useState(false);

  const launch = async () => {
    setLaunching(true);
    setMessage('');
    try {
      const result = await onLaunchInstaller();
      if (result && result.ok === false) setMessage('Installer unavailable');
      else setMessage('Installer launched');
    } catch {
      setMessage('Installer launch failed');
    } finally {
      setLaunching(false);
    }
  };

  return (
    <div className="tliRoot">
      <div className="tliPanel">
        <div className="tliKicker">Install Mode</div>
        <h1 className="tliTitle">Install TornLinux</h1>
        <p className="tliBody">
          Launch the TornLinux installer to place the system on disk. This is separate from the live environment.
        </p>

        <div className="tliActions">
          <button type="button" className="tliButton tliButton--primary" onClick={() => void launch()} disabled={launching}>
            {launching ? 'Launching...' : 'Launch Installer'}
          </button>
          <button type="button" className="tliButton tliButton--secondary" onClick={onBack} disabled={launching}>
            Back
          </button>
        </div>

        {message ? <div className="tliMessage">{message}</div> : null}
      </div>
    </div>
  );
}
