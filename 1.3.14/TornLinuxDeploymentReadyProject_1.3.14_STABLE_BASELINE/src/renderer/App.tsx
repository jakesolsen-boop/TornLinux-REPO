import React, { useEffect, useMemo, useState } from 'react';
import { computeAppLayout } from '@shared/layout';
import { usePlayerState } from './hooks/use-player-state';
import { TornLinuxHeader } from './components/TornLinuxHeader';
import { TornStatsOverlay } from './components/TornStatsOverlay';
import { SettingsDrawer } from './components/SettingsDrawer';
import { SurfaceHost } from './components/SurfaceHost';
import { FirstRunSetup } from './components/FirstRunSetup';
import TornLinuxSystemBar from './components/TornLinuxSystemBar';
import './styles/app.css';
import './styles/settings-drawer.css';
import './styles/first-run-setup.css';
import './styles/system-bar.css';

export function App() {
  const [settings, setSettings] = useState({
    layoutMode: 'split' as const,
    discordWidth: 480,
    tornUrl: 'https://www.torn.com/',
    discordUrl: 'https://discord.com/app',
    refreshIntervalMs: 30000,
    tornStatsOpen: false,
  });
  const [viewport, setViewport] = useState({ width: typeof window === 'undefined' ? 1600 : window.innerWidth, height: typeof window === 'undefined' ? 980 : window.innerHeight });
  const [configStatus, setConfigStatus] = useState<{ hasTornApiKey: boolean; configPath: string } | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [setupOpen, setSetupOpen] = useState(false);
  const { state, loading } = usePlayerState(settings.refreshIntervalMs);

  useEffect(() => {
    const load = async () => {
      const nextSettings = await window.tornlinux?.getSettings();
      const nextConfigStatus = await window.tornlinux?.getConfigStatus();
      if (nextSettings) setSettings(nextSettings);
      if (nextConfigStatus) setConfigStatus(nextConfigStatus);
    };
    const onResize = () => setViewport({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', onResize);
    const firstRunComplete = typeof window !== 'undefined' ? (localStorage.getItem('tornlinux.firstRunComplete') === 'true' || localStorage.getItem('tornlinux.firstRunSentinel') === 'true') : false;
    if (!firstRunComplete) setSetupOpen(true);
    load().catch(console.error);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (state?.settings) setSettings(state.settings);
  }, [state]);

  const layout = useMemo(() => computeAppLayout(viewport, settings.layoutMode, settings.discordWidth), [viewport, settings]);
  const player = state?.player ?? { name: 'No API Key', level: 0, money: '$0', energy: { current: 0, max: 150 }, nerve: { current: 0, max: 50 }, life: { current: 0, max: 1 }, status: { level: 'offline' as const, kind: 'offline' as const, label: 'Offline', description: 'No API key configured', until: null } };
  const tornStats = state?.tornStats ?? { battleStats: 'Unknown', netWorth: '$0', cooldowns: '0', freshness: 'Unknown', fairFight: 'Unknown', status: 'Unavailable' };

  const reloadState = async () => {
    const nextConfigStatus = await window.tornlinux?.getConfigStatus();
    const nextSettings = await window.tornlinux?.getSettings();
    if (nextConfigStatus) {
      setConfigStatus(nextConfigStatus);
      if (!nextConfigStatus.hasTornApiKey && typeof window !== 'undefined' && localStorage.getItem('tornlinux.firstRunComplete') !== 'true') {
        setSetupOpen(true);
      }
    }
    if (nextSettings) setSettings(nextSettings);
  };

  const toggleLayout = async () => {
    const nextMode = await window.tornlinux?.toggleLayout();
    if (nextMode) setSettings((current) => ({ ...current, layoutMode: nextMode }));
  };

  const toggleTornStats = async () => {
    const nextOpen = await window.tornlinux?.toggleTornStats();
    if (typeof nextOpen === 'boolean') setSettings((current) => ({ ...current, tornStatsOpen: nextOpen }));
  };

  return (
    <div className="tla-root">
      <header className="tla-header">
        <TornLinuxHeader
          player={player}
          layoutMode={layout.resolvedMode}
          splitAllowed={layout.splitAllowed}
          onToggleLayout={toggleLayout}
          onToggleTornStats={toggleTornStats}
          onOpenSettings={() => setSettingsOpen(true)}
        />
      </header>

      <main className="tla-content" style={{ gridTemplateColumns: layout.resolvedMode === 'split' ? `minmax(0, 1fr) minmax(340px, ${layout.discordWidth}px)` : 'minmax(0, 1fr)' }}>
        <section className="tla-pane tla-pane--torn">
          {!configStatus?.hasTornApiKey && <div className="tla-banner">Add your Torn API key in Settings or at <code>{configStatus?.configPath ?? '~/.tornlinux/config.json'}</code></div>}
          {loading && <div className="tla-banner">Loading player state…</div>}
          <div className="tla-pane__label">Torn</div>
          <SurfaceHost title="Torn" src={settings.tornUrl} />
        </section>

        {layout.resolvedMode === 'split' && (
          <aside className="tla-pane tla-pane--discord">
            <div className="tla-pane__label">Discord</div>
            <SurfaceHost title="Discord" src={settings.discordUrl} />
          </aside>
        )}
      </main>

      <TornStatsOverlay open={settings.tornStatsOpen} data={tornStats} onClose={() => toggleTornStats().catch(console.error)} />
      <TornLinuxSystemBar settings={settings} />

      <SettingsDrawer open={settingsOpen} currentSettings={settings} onClose={() => setSettingsOpen(false)} onSaved={() => { setSettingsOpen(false); reloadState().catch(console.error); }} />
    </div>
  );
}
