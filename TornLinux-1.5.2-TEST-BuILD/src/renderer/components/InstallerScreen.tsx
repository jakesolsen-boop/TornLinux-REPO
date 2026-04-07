import React from 'react';

export function InstallerScreen({
  onLaunchInstaller,
  onBack,
}: {
  onLaunchInstaller: () => Promise<any>;
  onBack: () => void;
}) {
  const [launching, setLaunching] = React.useState(false);

  const launch = async () => {
    setLaunching(true);
    try {
      await onLaunchInstaller();
    } finally {
      setLaunching(false);
    }
  };

  return (
    <div className="tls-installerRoot">
      <div className="tls-installerCard">
        <div className="tls-installerEyebrow">Installer</div>
        <h1 className="tls-installerTitle">Install TornLinux</h1>
        <p className="tls-installerText">
          Launch the installer to deploy TornLinux to disk. This will guide you through partitioning and setup.
        </p>

        <div className="tls-installerActions">
          <button type="button" onClick={() => void launch()} disabled={launching}>
            {launching ? 'Launching...' : 'Launch Installer'}
          </button>
          <button type="button" onClick={onBack}>Back</button>
        </div>
      </div>
    </div>
  );
}
