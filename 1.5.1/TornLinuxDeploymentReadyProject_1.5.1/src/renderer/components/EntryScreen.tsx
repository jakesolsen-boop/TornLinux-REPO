import React, { useEffect, useState } from 'react';
import '../styles/entry-screen.css';

type EntryMode = 'live' | 'install';

const DEFAULT_COUNTDOWN = 8;

export function EntryScreen({
  initialMode,
  onRunLive,
  onInstall,
}: {
  initialMode: EntryMode;
  onRunLive: () => void;
  onInstall: () => void;
}) {
  const [selected, setSelected] = useState<EntryMode>(initialMode);
  const [secondsLeft, setSecondsLeft] = useState(DEFAULT_COUNTDOWN);

  useEffect(() => {
    setSelected(initialMode);
    setSecondsLeft(DEFAULT_COUNTDOWN);
  }, [initialMode]);

  useEffect(() => {
    if (secondsLeft <= 0) {
      if (selected === 'install') onInstall();
      else onRunLive();
      return;
    }
    const id = window.setTimeout(() => setSecondsLeft((value) => value - 1), 1000);
    return () => window.clearTimeout(id);
  }, [secondsLeft, selected, onInstall, onRunLive]);

  return (
    <div className="tlnEntryRoot">
      <div className="tlnEntryPanel">
        <div className="tlnEntryBrand">
          <div className="tlnEntryLogo" />
          <div className="tlnEntryTitle">TornLinux</div>
          <div className="tlnEntrySubtitle">Choose how to enter the system</div>
        </div>

        <div className="tlnEntryActions">
          <button
            className={`tlnEntryButton tlnEntryButton--primary ${selected === 'live' ? 'is-selected' : ''}`}
            onClick={() => {
              setSelected('live');
              onRunLive();
            }}
            onMouseEnter={() => setSelected('live')}
            autoFocus={selected === 'live'}
          >
            Run Live
          </button>

          <button
            className={`tlnEntryButton tlnEntryButton--secondary ${selected === 'install' ? 'is-selected' : ''}`}
            onClick={() => {
              setSelected('install');
              onInstall();
            }}
            onMouseEnter={() => setSelected('install')}
            autoFocus={selected === 'install'}
          >
            Install TornLinux
          </button>
        </div>

        <div className="tlnEntryFooter">
          Auto {selected === 'install' ? 'install' : 'run live'} in {secondsLeft}s
        </div>
      </div>
    </div>
  );
}
