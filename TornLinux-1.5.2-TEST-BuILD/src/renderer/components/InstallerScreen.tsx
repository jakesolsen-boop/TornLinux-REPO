import React from 'react';
import type { InstallerApplyResult, InstallerDisk, InstallerMode, InstallerPlan } from '@shared/types';

export function InstallerScreen({
  version,
  onBack,
}: {
  version: string;
  onBack: () => void;
}) {
  const [mode, setMode] = React.useState<InstallerMode>('auto');
  const [disks, setDisks] = React.useState<InstallerDisk[]>([]);
  const [selectedDisk, setSelectedDisk] = React.useState('');
  const [plan, setPlan] = React.useState<InstallerPlan | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [planning, setPlanning] = React.useState(false);
  const [applying, setApplying] = React.useState(false);
  const [confirmation, setConfirmation] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [applyResult, setApplyResult] = React.useState<InstallerApplyResult | null>(null);

  const refreshDisks = React.useCallback(async () => {
    setLoading(true);
    const nextDisks = await window.tornlinux?.getInstallerDisks?.();
    const available = nextDisks || [];
    setDisks(available);
    setSelectedDisk((current) => current || available[0]?.path || '');
    setLoading(false);
  }, []);

  React.useEffect(() => {
    void refreshDisks();
  }, [refreshDisks]);

  React.useEffect(() => {
    if (!selectedDisk) {
      setPlan(null);
      return;
    }
    const buildPlan = async () => {
      setPlanning(true);
      const nextPlan = await window.tornlinux?.previewInstallerPlan?.(selectedDisk, mode);
      setPlan(nextPlan || null);
      setPlanning(false);
    };
    void buildPlan();
  }, [mode, selectedDisk]);

  const expectedConfirmation = selectedDisk ? `ERASE ${selectedDisk}` : 'ERASE /dev/sdX';

  const applyPlan = async () => {
    if (!selectedDisk) {
      setMessage('Select a disk before applying.');
      return;
    }
    setApplying(true);
    setMessage('');
    const result = await window.tornlinux?.applyInstallerPlan?.(selectedDisk, mode, confirmation);
    setApplyResult(result || null);
    setApplying(false);
    setMessage(result?.ok ? 'Install completed.' : (result?.error || 'Install failed.'));
  };

  return (
    <div className="tls-installerRoot">
      <div className="tls-installerCard">
        <div className="tls-installerEyebrow">Custom installer engine</div>
        <h1 className="tls-installerTitle">Install TornLinux {version}</h1>
        <p className="tls-installerText">
          This installer surface now uses TornLinux disk discovery and plan generation directly. It is no longer based
          on Calamares.
        </p>

        <div className="tls-installerChecklist" aria-label="Installer flow">
          <div className="tls-installerStep">
            <strong>1. Select install strategy</strong>
            <span>Auto mode creates a dedicated GPT layout. Manual mode is reserved for advanced partition mapping.</span>
          </div>
          <div className="tls-installerStep">
            <strong>2. Choose target disk</strong>
            <span>The installer backend reads live block devices directly from the running environment.</span>
          </div>
          <div className="tls-installerStep">
            <strong>3. Review install plan</strong>
            <span>The current build previews the partitioning and deployment plan before we enable destructive apply.</span>
          </div>
        </div>

        <div className="tls-installerModeRow">
          <button type="button" className={mode === 'auto' ? 'is-current' : ''} onClick={() => setMode('auto')}>
            Automatic Install
          </button>
          <button type="button" className={mode === 'manual' ? 'is-current' : ''} onClick={() => setMode('manual')}>
            Manual Layout
          </button>
        </div>

        <div className="tls-installerDiskList">
          {loading ? (
            <div className="tls-installerNote">Scanning disks...</div>
          ) : disks.length ? (
            disks.map((disk) => (
              <button
                key={disk.path}
                type="button"
                className={`tls-installerDisk ${selectedDisk === disk.path ? 'is-current' : ''}`}
                onClick={() => setSelectedDisk(disk.path)}
              >
                <span>{disk.model || disk.name}</span>
                <strong>{disk.sizeLabel}</strong>
                <em>{disk.path}</em>
              </button>
            ))
          ) : (
            <div className="tls-installerNote">No installable disks detected.</div>
          )}
        </div>

        <div className="tls-installerPlan">
          <div className="tls-installerPlanTitle">Planned Operations</div>
          {planning ? (
            <div className="tls-installerNote">Building install plan...</div>
          ) : plan?.ok && plan.operations.length ? (
            <ul className="tls-installerPlanList">
              {plan.operations.map((operation, index) => (
                <li key={`${operation.kind}-${operation.target}-${index}`}>
                  <strong>{operation.kind}</strong>
                  <span>{operation.detail}</span>
                  <em>{operation.target}</em>
                </li>
              ))}
            </ul>
          ) : (
            <div className="tls-installerNote">{plan?.error || 'Select a disk to generate an install plan.'}</div>
          )}
        </div>

        <div className="tls-installerConfirm">
          <label htmlFor="tls-installer-confirm">Type <strong>{expectedConfirmation}</strong> to unlock apply.</label>
          <input
            id="tls-installer-confirm"
            type="text"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            placeholder={expectedConfirmation}
          />
        </div>

        <div className="tls-installerActions">
          <button
            type="button"
            disabled={applying || mode !== 'auto' || confirmation !== expectedConfirmation || !plan?.ok}
            onClick={() => void applyPlan()}
          >
            {applying ? 'Applying Install...' : 'Apply Install Plan'}
          </button>
          <button type="button" onClick={() => void refreshDisks()}>Rescan Disks</button>
          <button type="button" onClick={onBack}>Back</button>
        </div>

        <div className="tls-installerNote">
          Apply is restricted to automatic mode and requires the explicit disk erase confirmation string.
        </div>
        {applyResult?.logs ? (
          <pre className="tls-installerLogs">{applyResult.logs}</pre>
        ) : null}
        {message ? <div className="tls-installerNote">{message}</div> : null}
      </div>
    </div>
  );
}
