export type LayoutMode = 'torn' | 'split';

export interface MeterStat {
  current: number;
  max: number;
}

export type PlayerStatusLevel = 'online' | 'warning' | 'offline';
export type PlayerStatusKind = 'okay' | 'hospital' | 'jail' | 'traveling' | 'abroad' | 'offline' | 'unknown';

export interface PlayerStatus {
  level: PlayerStatusLevel;
  kind: PlayerStatusKind;
  label: string;
  description: string;
  until: number | null;
}

export interface PlayerSnapshot {
  name: string;
  level: number;
  money: string;
  energy: MeterStat;
  happiness: MeterStat;
  nerve: MeterStat;
  life: MeterStat;
  status: PlayerStatus;
}

export interface TornStatsSummary {
  battleStats: string;
  strength: string;
  defense: string;
  speed: string;
  dexterity: string;
  netWorth: string;
  statDeltas: string;
  freshness: string;
  fairFight: string;
  spySource: string;
  attacksWon: string;
  defendsWon: string;
  xanaxTaken: string;
  refills: string;
  statEnhancersUsed: string;
  energyDrinksUsed: string;
  meritsBought: string;
  recentAttacks: string;
  status: string;
}

export interface AppSettings {
  layoutMode: LayoutMode;
  discordWidth: number;
  timezone: string;
  tornUrl: string;
  discordUrl: string;
  refreshIntervalMs: number;
  tornStatsOpen: boolean;
}

export interface AppConfig {
  tornApiKey?: string;
  tornStatsApiKey?: string;
}

export interface ConfigStatus {
  hasTornApiKey: boolean;
  hasTornStatsApiKey: boolean;
  configPath?: string;
}

export interface BootIntent {
  installer: boolean;
  cmdline: string;
}

export interface UnifiedPlayerState {
  player: PlayerSnapshot;
  tornStats: TornStatsSummary;
  settings: AppSettings;
  lastUpdated: string;
  sourceHealth: {
    torn: 'ok' | 'warning' | 'error';
    tornStats: 'ok' | 'warning' | 'error';
  };
}

export interface DisplayState {
  output: string;
  currentMode: string;
  modes: string[];
}

export type PowerAction = 'reload' | 'restart' | 'shutdown';

export type InstallerMode = 'auto' | 'manual';

export interface InstallerDisk {
  name: string;
  path: string;
  sizeBytes: number;
  sizeLabel: string;
  model: string;
  vendor: string;
  transport: string;
  removable: boolean;
  hotplug: boolean;
  mountpoints: string[];
  children?: InstallerDiskPartition[];
}

export interface InstallerDiskPartition {
  name: string;
  path: string;
  sizeBytes: number;
  sizeLabel: string;
  fstype: string;
  mountpoint: string;
}

export interface InstallerPlanOperation {
  kind: string;
  target: string;
  detail: string;
}

export interface InstallerPlan {
  ok: boolean;
  mode: InstallerMode;
  targetDisk: string;
  operations: InstallerPlanOperation[];
  error?: string;
}

export interface InstallerApplyResult {
  ok: boolean;
  mode: InstallerMode;
  targetDisk: string;
  logs?: string;
  error?: string;
}

export interface LauncherResult {
  ok: boolean;
  method: string;
  detail?: string;
}

export type TornLinuxBridge = {
  getAppVersion: () => Promise<string>;
  getBootIntent: () => Promise<BootIntent>;
  getSettings: () => Promise<AppSettings>;
  setSettings: (settings: Partial<AppSettings>) => Promise<AppSettings>;
  toggleLayout: () => Promise<LayoutMode>;
  setLayout: (mode: LayoutMode) => Promise<LayoutMode>;
  toggleTornStats: () => Promise<boolean>;
  openSettings: () => Promise<void>;
  log: (level: 'info' | 'warn' | 'error', message: string, meta?: unknown) => Promise<void>;
  getConfig: () => Promise<AppConfig>;
  saveConfig: (config: AppConfig) => Promise<ConfigStatus>;
  getConfigStatus: () => Promise<ConfigStatus>;
  getUnifiedState: () => Promise<UnifiedPlayerState>;
  launchSoundSettings: () => Promise<LauncherResult>;
  launchNetworkSettings: () => Promise<LauncherResult>;
  getNetworkStatus: () => Promise<NetworkStatus>;
  getDisplayState: () => Promise<DisplayState | null>;
  setDisplayMode: (mode: string) => Promise<{ ok: boolean; mode: string; output?: string }>;
  powerAction: (action: PowerAction) => Promise<{ ok: boolean; action: PowerAction; method: string }>;
  launchBluetoothSettings: () => Promise<LauncherResult>;
  getInstallerDisks: () => Promise<InstallerDisk[]>;
  previewInstallerPlan: (diskPath: string, mode: InstallerMode) => Promise<InstallerPlan>;
  applyInstallerPlan: (diskPath: string, mode: InstallerMode, confirmation: string) => Promise<InstallerApplyResult>;
  getSystemVolume: () => Promise<number>;
  setSystemVolume: (value: number) => Promise<number>;
};

export type NetworkConnectivity = 'online' | 'offline';

export interface NetworkStatus {
  connectivity: NetworkConnectivity;
  raw: string;
}
