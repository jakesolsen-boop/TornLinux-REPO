import React, { useEffect, useMemo, useState } from 'react';
import { computeAppLayout } from '@shared/layout';
import { usePlayerState } from './hooks/use-player-state';
import { useNetworkStatus } from './hooks/use-network-status';
import { TornLinuxHeader } from './components/TornLinuxHeader';
import { TornStatsOverlay } from './components/TornStatsOverlay';
import { SettingsDrawer } from './components/SettingsDrawer';
import { SurfaceHost } from './components/SurfaceHost';
import { FirstRunSetup } from './components/FirstRunSetup';
import { FirstUseLanding } from './components/FirstUseLanding';
import { EntryScreen } from './components/EntryScreen';
import { InstallerScreen } from './components/InstallerScreen';
import TornLinuxSystemBar from './components/TornLinuxSystemBar';
import './styles/app.css';
import './styles/settings-drawer.css';
import './styles/first-run-setup.css';
import './styles/system-bar.css';
import './styles/network-gate.css';
import './styles/entry-screen.css';
import './styles/landing-screen.css';
import './styles/installer-screen.css';

type BootStage = 'entry' | 'landing' | 'installer' | 'system';
type EntryMode = 'live' | 'install';

const ENTRY_MODE_KEY = 'tornlinux.entry.lastMode';
const FIRST_RUN_KEY = 'tornlinux.firstRunComplete';

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
  const [config, setConfig] = useState<{ tornApiKey?: string }>({});
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [apiGateOpen, setApiGateOpen] = useState(false);
  const [bootStage, setBootStage] = useState<BootStage>('entry');
  const [entryMode, setEntryMode] = useState<EntryMode>('live');

  const { state, loading, refresh: refreshPlayer } = usePlayerState(30000);
  const { isOnline, refresh: refreshNetwork } = useNetworkStatus();

  useEffect(() => {
    const load = async () => {
      const nextSettings = await window.tornlinux?.getSettings();
      const nextConfigStatus = await window.tornlinux?.getConfigStatus();
      const nextConfig = await window.tornlinux?.getConfig();
      if (nextSettings) setSettings(nextSettings);
      if (nextConfigStatus) setConfigStatus(nextConfigStatus);
      if (nextConfig) setConfig(nextConfig);

      const storedMode = typeof window !== 'undefined' ? localStorage.getItem(ENTRY_MODE_KEY) : null;
      if (storedMode === 'install' || storedMode === 'live') setEntryMode(storedMode);
    };

    const onResize = () => setViewport({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', onResize);
    void load();
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (state?.settings) setSettings(state.settings);
  }, [state]);

  const layout = useMemo(() => computeAppLayout(viewport, settings.layoutMode, 480), [viewport, settings.layoutMode]);
  const player = state?.player ?? {
    name: 'No API Key',
    level: 0,
    money: '$0',
    energy: { current: 0, max: 150 },
    happiness: { current: 0, max: 0 },
    nerve: { current: 0, max: 50 },
    life: { current: 0, max: 1 },
    status: { level: 'offline' as const, kind: 'offline' as const, label: 'Offline', description: 'No API key configured', until: null },
  };
  const tornStats = state?.tornStats ?? {
    battleStats: 'Unknown',
    strength: 'Unknown',
    defense: 'Unknown',
    speed: 'Unknown',
    dexterity: 'Unknown',
    netWorth: '$0',
    statDeltas: 'STR 0 · DEF 0 · DEX 0 · SPD 0',
    freshness: 'Unknown',
    fairFight: 'Unknown',
    spySource: 'Unavailable',
    attacksWon: 'Unknown',
    defendsWon: 'Unknown',
    xanaxTaken: 'Unknown',
    refills: 'Unknown',
    statEnhancersUsed: 'Unknown',
    energyDrinksUsed: 'Unknown',
    meritsBought: 'Unknown',
    recentAttacks: 'No recent attack summary',
    status: 'Unavailable',
  };

  const hasValidApi = Boolean(configStatus?.hasTornApiKey);

  const reloadState = async () => {
    const nextConfigStatus = await window.tornlinux?.getConfigStatus();
    const nextSettings = await window.tornlinux?.getSettings();
    const nextConfig = await window.tornlinux?.getConfig();

    if (nextConfigStatus) setConfigStatus(nextConfigStatus);
    if (nextSettings) setSettings(nextSettings);
    if (nextConfig) setConfig(nextConfig);

    await refreshPlayer().catch(() => undefined);
    await refreshNetwork().catch(() => undefined);
  };

  const saveApiKey = async (apiKey: string) => {
    const key = String(apiKey || '').trim();
    await window.tornlinux?.saveConfig({
      tornApiKey: key,
    });
    await reloadState();
  };

  const markFirstRunComplete = () => {
    if (typeof window !== 'undefined') localStorage.setItem(FIRST_RUN_KEY, 'true');
  };

  const runLive = async () => {
    if (typeof window !== 'undefined') localStorage.setItem(ENTRY_MODE_KEY, 'live');
    setEntryMode('live');
    const firstRunComplete = typeof window !== 'undefined' ? localStorage.getItem(FIRST_RUN_KEY) === 'true' : false;
    setBootStage(firstRunComplete ? 'system' : 'landing');
    await reloadState();
  };

  const installMode = () => {
    if (typeof window !== 'undefined') localStorage.setItem(ENTRY_MODE_KEY, 'install');
    setEntryMode('install');
    setBootStage('installer');
  };

  const continueFromLanding = async () => {
    markFirstRunComplete();
    setBootStage('system');
    await reloadState();
    if (!hasValidApi) setApiGateOpen(true);
  };

  const launchInstaller = async () => {
    return await window.tornlinux?.launchInstaller?.();
  };

  const toggleTornStats = async () => {
    const nextOpen = await window.tornlinux?.toggleTornStats();
    if (typeof nextOpen === 'boolean') {
      setSettings((current) => ({ ...current, tornStatsOpen: nextOpen }));
      await refreshPlayer().catch(() => undefined);
    }
  };

  const openNetworkSettings = async () => {
    await window.tornlinux?.launchNetworkSettings?.();
  };

  const openBluetoothSettings = async () => {
    await window.tornlinux?.launchBluetoothSettings?.();
  };

  if (bootStage === 'entry') {
    return <EntryScreen initialMode={entryMode} onRunLive={() => { void runLive(); }} onInstall={installMode} />;
  }

  if (bootStage === 'landing') {
    return (
      <FirstUseLanding
        isOnline={isOnline}
        hasApiKey={hasValidApi}
        initialApiKey={config.tornApiKey}
        onOpenNetworkSettings={openNetworkSettings}
        onSaveApiKey={saveApiKey}
        onContinue={() => { void continueFromLanding(); }}
      />
    );
  }

  if (bootStage === 'installer') {
    return (
      <InstallerScreen
        onLaunchInstaller={launchInstaller}
        onBack={() => setBootStage('entry')}
      />
    );
  }

  return (
    <div className="tla-root">
      {apiGateOpen ? (
        <FirstRunSetup
          open={apiGateOpen}
          initialApiKey={config.tornApiKey}
          onSave={saveApiKey}
          onClose={() => setApiGateOpen(false)}
        />
      ) : null}

      <header className="tla-header">
        <TornLinuxHeader
          player={player}
          tornStats={tornStats}
          networkOnline={isOnline}
          onToggleTornStats={toggleTornStats}
          onOpenNetworkSettings={openNetworkSettings}
          onOpenSettings={() => setSettingsOpen(true)}
        />
      </header>

      <main className="tla-content" style={{ gridTemplateColumns: layout.resolvedMode === 'split' ? `minmax(0, 1fr) minmax(340px, ${layout.discordWidth}px)` : 'minmax(0, 1fr)' }}>
        <section className="tla-pane tla-pane--torn">
          {!configStatus?.hasTornApiKey && <div className="tla-banner">No valid API key configured. Add one in Settings or continue in limited mode.</div>}
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

      <TornStatsOverlay open={settings.tornStatsOpen} data={tornStats} onClose={() => void toggleTornStats()} />
      <TornLinuxSystemBar settings={settings} />

      <SettingsDrawer
        open={settingsOpen}
        currentSettings={settings}
        networkOnline={isOnline}
        onOpenNetworkSettings={openNetworkSettings}
        onOpenBluetoothSettings={openBluetoothSettings}
        onClose={() => setSettingsOpen(false)}
        onSaved={() => {
          setSettingsOpen(false);
          void reloadState();
        }}
      />
    </div>
  );
}
