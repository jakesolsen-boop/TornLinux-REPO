const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const CURRENT_BUILD_VERSION = '1.4.0';
const SEEDED_TEST_KEY = 't12kBJHUoufNNdqD';
const SEEDED_BUILD_VERSION = '1.4.0';

function getConfigDir() {
  return path.join(os.homedir(), '.tornlinux');
}

function getConfigPath() {
  return path.join(getConfigDir(), 'config.json');
}

function normalizeConfig(parsed) {
  return {
    tornApiKey: typeof parsed?.tornApiKey === 'string' ? parsed.tornApiKey : '',
    seededBuildVersion: typeof parsed?.seededBuildVersion === 'string' ? parsed.seededBuildVersion : '',
  };
}

function clearSeededKeyIfExpired(config) {
  if (
    config.tornApiKey === SEEDED_TEST_KEY &&
    config.seededBuildVersion === SEEDED_BUILD_VERSION &&
    CURRENT_BUILD_VERSION !== SEEDED_BUILD_VERSION
  ) {
    return { tornApiKey: '', seededBuildVersion: '' };
  }
  return config;
}

function readConfig() {
  try {
    const raw = fs.readFileSync(getConfigPath(), 'utf-8');
    const parsed = JSON.parse(raw);
    return clearSeededKeyIfExpired(normalizeConfig(parsed));
  } catch {
    return { tornApiKey: SEEDED_TEST_KEY, seededBuildVersion: SEEDED_BUILD_VERSION };
  }
}

function writeConfig(config) {
  const next = {
    tornApiKey: String(config.tornApiKey || ''),
    seededBuildVersion: String(config.seededBuildVersion || ''),
  };
  fs.mkdirSync(getConfigDir(), { recursive: true, mode: 0o700 });
  fs.writeFileSync(getConfigPath(), JSON.stringify(next, null, 2) + '\n', { mode: 0o600 });
  try {
    fs.chmodSync(getConfigDir(), 0o700);
    fs.chmodSync(getConfigPath(), 0o600);
  } catch {}
}

function getConfigStatus() {
  const config = readConfig();
  return {
    hasTornApiKey: config.tornApiKey.trim().length > 0,
    configPath: getConfigPath(),
  };
}

module.exports = { getConfigPath, readConfig, writeConfig, getConfigStatus };
