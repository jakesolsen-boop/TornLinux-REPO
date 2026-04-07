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
  nerve: MeterStat;
  life: MeterStat;
  status: PlayerStatus;
}

export interface TornStatsSummary {
  battleStats: string;
  netWorth: string;
  cooldowns: string;
  freshness: string;
  fairFight: string;
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

export type TornLinuxBridge = {
  getSettings: () => Promise<AppSettings>;
  setSettings: (settings: AppSettings) => Promise<void>;
  getConfig: () => Promise<{ tornApiKey?: string }>;
  saveConfig: (config: { tornApiKey?: string }) => Promise<void>;
  getConfigStatus: () => Promise<{ hasTornApiKey: boolean }>;
  launchSoundSettings: () => Promise<{ ok: boolean; method: string }>;
  launchNetworkSettings: () => Promise<{ ok: boolean; method: string }>;
};
