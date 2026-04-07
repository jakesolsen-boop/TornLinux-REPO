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
        discordWidth: DEFAULT_SETTINGS.discordWidth,
        tornUrl: DEFAULT_SETTINGS.tornUrl,
        discordUrl: DEFAULT_SETTINGS.discordUrl,
        refreshIntervalMs: DEFAULT_SETTINGS.refreshIntervalMs,
        tornStatsOpen: typeof parsed.tornStatsOpen === 'boolean' ? parsed.tornStatsOpen : DEFAULT_SETTINGS.tornStatsOpen,
      };
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  write(partial) {
    const next = { ...this.read(), ...partial };
    next.discordWidth = DEFAULT_SETTINGS.discordWidth;
    next.tornUrl = DEFAULT_SETTINGS.tornUrl;
    next.discordUrl = DEFAULT_SETTINGS.discordUrl;
    next.refreshIntervalMs = DEFAULT_SETTINGS.refreshIntervalMs;
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
