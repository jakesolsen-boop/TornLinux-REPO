const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const DEFAULT_SETTINGS = {
  layoutMode: 'split',
  discordWidth: 480,
  tornUrl: 'https://www.torn.com/',
  discordUrl: 'https://discord.com/app',
  refreshIntervalMs: 30000,
  tornStatsOpen: false,
};

function getSettingsDir() {
  return path.join(os.homedir(), '.tornlinux');
}

function getSettingsPath() {
  return path.join(getSettingsDir(), 'settings.json');
}

class FileSettingsStore {
  read() {
    try {
      const raw = fs.readFileSync(getSettingsPath(), 'utf-8');
      const parsed = JSON.parse(raw);
      return {
        layoutMode: parsed.layoutMode === 'torn' ? 'torn' : 'split',
        discordWidth: typeof parsed.discordWidth === 'number' ? parsed.discordWidth : DEFAULT_SETTINGS.discordWidth,
        tornUrl: typeof parsed.tornUrl === 'string' ? parsed.tornUrl : DEFAULT_SETTINGS.tornUrl,
        discordUrl: typeof parsed.discordUrl === 'string' ? parsed.discordUrl : DEFAULT_SETTINGS.discordUrl,
        refreshIntervalMs: typeof parsed.refreshIntervalMs === 'number' ? Math.max(30000, parsed.refreshIntervalMs) : DEFAULT_SETTINGS.refreshIntervalMs,
        tornStatsOpen: typeof parsed.tornStatsOpen === 'boolean' ? parsed.tornStatsOpen : DEFAULT_SETTINGS.tornStatsOpen,
      };
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  write(partial) {
    const next = { ...this.read(), ...partial };
    if (typeof next.refreshIntervalMs !== 'number' || !Number.isFinite(next.refreshIntervalMs)) {
      next.refreshIntervalMs = DEFAULT_SETTINGS.refreshIntervalMs;
    }
    next.refreshIntervalMs = Math.max(30000, next.refreshIntervalMs);
    fs.mkdirSync(getSettingsDir(), { recursive: true, mode: 0o700 });
    fs.writeFileSync(getSettingsPath(), JSON.stringify(next, null, 2) + '\n', { mode: 0o600 });
    try {
      fs.chmodSync(getSettingsDir(), 0o700);
      fs.chmodSync(getSettingsPath(), 0o600);
    } catch {}
    return next;
  }
}

module.exports = { DEFAULT_SETTINGS, settingsStore: new FileSettingsStore() };
