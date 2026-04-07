const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

function getConfigDir() {
  return path.join(os.homedir(), '.tornlinux');
}

function getConfigPath() {
  return path.join(getConfigDir(), 'config.json');
}

function readConfig() {
  try {
    const raw = fs.readFileSync(getConfigPath(), 'utf-8');
    const parsed = JSON.parse(raw);
    return {
      tornApiKey: typeof parsed.tornApiKey === 'string' ? parsed.tornApiKey : '',
      tornStatsApiKey: typeof parsed.tornStatsApiKey === 'string' ? parsed.tornStatsApiKey : '',
    };
  } catch {
    return { tornApiKey: '', tornStatsApiKey: '' };
  }
}

function writeConfig(config) {
  fs.mkdirSync(getConfigDir(), { recursive: true, mode: 0o700 });
  fs.writeFileSync(getConfigPath(), JSON.stringify({
    tornApiKey: String(config.tornApiKey || ''),
    tornStatsApiKey: String(config.tornStatsApiKey || ''),
  }, null, 2) + '\n', { mode: 0o600 });
  try {
    fs.chmodSync(getConfigDir(), 0o700);
    fs.chmodSync(getConfigPath(), 0o600);
  } catch {}
}

function getConfigStatus() {
  const config = readConfig();
  return {
    hasTornApiKey: config.tornApiKey.trim().length > 0,
    hasTornStatsApiKey: config.tornStatsApiKey.trim().length > 0,
    configPath: getConfigPath(),
  };
}

module.exports = { getConfigPath, readConfig, writeConfig, getConfigStatus };
