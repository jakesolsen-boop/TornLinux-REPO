const { execFile, spawn } = require('child_process');
const { app, BrowserWindow, ipcMain, shell, Menu, session, screen } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const { IPC_CHANNELS } = require('./runtime/ipc.cjs');
const { settingsStore } = require('./runtime/settings-store.cjs');
const { getConfigStatus, readConfig, writeConfig } = require('./runtime/config-store.cjs');
const { isAllowedEmbedUrl, isAllowedExternalUrl } = require('./runtime/webview-policy.cjs');
const { getUnifiedState } = require('./runtime/unified-state.cjs');

const { version: APP_VERSION } = require(path.join(__dirname, '..', 'package.json'));
const INSTALLER_SCRIPT = '/usr/local/bin/tornlinux-installer';

function resolveRendererIndex() {
  return path.join(__dirname, '..', 'dist', 'renderer', 'index.html');
}

function applyWebviewPolicy() {
  app.on('web-contents-created', (_event, contents) => {
    contents.setWindowOpenHandler(({ url }) => {
      if (isAllowedExternalUrl(url)) {
        shell.openExternal(url);
      }
      return { action: 'deny' };
    });

    contents.on('will-navigate', (event, url) => {
      const isMainWindow = contents.getType() === 'window';
      if (isMainWindow && !url.startsWith('file://')) {
        event.preventDefault();
      }
    });

    contents.on('will-attach-webview', (event, webPreferences, params) => {
      if (!isAllowedEmbedUrl(params.src)) {
        event.preventDefault();
        return;
      }
      delete webPreferences.preload;
      webPreferences.nodeIntegration = false;
      webPreferences.contextIsolation = true;
      webPreferences.sandbox = true;
      webPreferences.webSecurity = true;
      webPreferences.allowRunningInsecureContent = false;
      webPreferences.javascript = true;
      webPreferences.plugins = false;
      webPreferences.devTools = false;
    });
  });

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Referrer-Policy': ['strict-origin-when-cross-origin'],
      },
    });
  });
}

function createMainWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;
  const win = new BrowserWindow({
    width,
    height,
    minWidth: 1280,
    minHeight: 760,
    frame: false,
    fullscreen: true,
    kiosk: true,
    autoHideMenuBar: true,
    show: false,
    backgroundColor: '#0c1016',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webviewTag: true,
      devTools: false,
    },
    title: `TornLinux ${APP_VERSION}`,
  });

  Menu.setApplicationMenu(null);
  win.removeMenu();

  let shown = false;
  const showWindow = () => {
    if (!shown) {
      shown = true;
      win.maximize();
      win.setFullScreen(true);
      win.show();
    }
  };

  win.once('ready-to-show', showWindow);
  setTimeout(showWindow, 3000);

  win.webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL) => {
    console.error('[main] did-fail-load', { errorCode, errorDescription, validatedURL });
    showWindow();
  });

  win.webContents.on('render-process-gone', (_event, details) => {
    console.error('[main] render-process-gone', details);
    showWindow();
  });

  win.webContents.on('unresponsive', () => {
    console.error('[main] renderer became unresponsive');
    showWindow();
  });

  const rendererIndex = resolveRendererIndex();
  console.log('[main] loading renderer', rendererIndex);
  win.loadFile(rendererIndex).catch((error) => {
    console.error('[main] failed to load renderer', error);
    showWindow();
  });
  return win;
}

app.whenReady().then(() => {
  applyWebviewPolicy();
  createMainWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('tornlinux:getAppVersion', async () => APP_VERSION);
ipcMain.handle('tornlinux:getBootIntent', async () => readBootIntent());
ipcMain.handle(IPC_CHANNELS.GET_SETTINGS, async () => settingsStore.read());
ipcMain.handle(IPC_CHANNELS.SET_SETTINGS, async (_event, partial) => settingsStore.write(partial));
ipcMain.handle(IPC_CHANNELS.TOGGLE_LAYOUT, async () => {
  const current = settingsStore.read();
  const next = current.layoutMode === 'split' ? 'torn' : 'split';
  settingsStore.write({ layoutMode: next });
  return next;
});
ipcMain.handle(IPC_CHANNELS.SET_LAYOUT, async (_event, mode) => {
  settingsStore.write({ layoutMode: mode });
  return mode;
});
ipcMain.handle(IPC_CHANNELS.TOGGLE_TORNSTATS, async () => {
  const current = settingsStore.read();
  const next = !current.tornStatsOpen;
  settingsStore.write({ tornStatsOpen: next });
  return next;
});
ipcMain.handle(IPC_CHANNELS.OPEN_SETTINGS, async () => undefined);
ipcMain.handle(IPC_CHANNELS.LOG, async (_event, level, message, meta) => {
  const entry = `[renderer:${level}] ${message}`;
  if (level === 'error') console.error(entry, meta);
  else if (level === 'warn') console.warn(entry, meta);
  else console.log(entry, meta);
});
ipcMain.handle(IPC_CHANNELS.GET_CONFIG_STATUS, async () => getConfigStatus());
ipcMain.handle(IPC_CHANNELS.GET_CONFIG, async () => readConfig());
ipcMain.handle(IPC_CHANNELS.SAVE_CONFIG, async (_event, config) => {
  writeConfig(config);
  return getConfigStatus();
});
ipcMain.handle(IPC_CHANNELS.GET_UNIFIED_STATE, async () => {
  const config = readConfig();
  return getUnifiedState(config.tornApiKey, config.tornStatsApiKey);
});

function getNetworkStatus() {
  return new Promise((resolve) => {
    execFile('nmcli', ['networking', 'connectivity'], { timeout: 4000 }, (error, stdout) => {
      if (error) {
        resolve({ connectivity: 'offline', raw: 'error' });
        return;
      }

      const raw = String(stdout || '').trim().toLowerCase();
      if (raw === 'full') {
        resolve({ connectivity: 'online', raw });
        return;
      }

      resolve({ connectivity: 'offline', raw: raw || 'unknown' });
    });
  });
}

function getSystemVolume() {
  return new Promise((resolve) => {
    execFile('amixer', ['get', 'Master'], { timeout: 4000 }, (error, stdout) => {
      if (error) {
        resolve(50);
        return;
      }
      const match = String(stdout || '').match(/\[(\d{1,3})%\]/);
      resolve(match ? Math.max(0, Math.min(100, Number(match[1]))) : 50);
    });
  });
}

function setSystemVolume(value) {
  return new Promise((resolve) => {
    const clamped = Math.max(0, Math.min(100, Number(value) || 0));
    execFile('amixer', ['set', 'Master', `${clamped}%`], { timeout: 4000 }, async (error) => {
      if (error) {
        resolve(await getSystemVolume());
        return;
      }
      resolve(clamped);
    });
  });
}

function getPrimaryWindow() {
  return BrowserWindow.getAllWindows()[0] || null;
}

function readBootIntent() {
  try {
    const cmdline = fs.readFileSync('/proc/cmdline', 'utf8');
    return {
      installer: /\btornlinux_installer=1\b/.test(cmdline),
      cmdline: cmdline.trim(),
    };
  } catch (_error) {
    return {
      installer: false,
      cmdline: '',
    };
  }
}

function parseDisplayState(stdout) {
  const text = String(stdout || '');
  const lines = text.split('\n');
  let currentOutput = null;
  let fallbackOutput = null;
  let isCollectingModes = false;
  let currentMode = '';
  const modes = [];

  for (const line of lines) {
    const outputMatch = line.match(/^(\S+)\s+connected(?:\s+primary)?/);
    if (outputMatch) {
      const output = outputMatch[1];
      if (!fallbackOutput) fallbackOutput = output;
      if (!currentOutput || /\sconnected\s+primary/.test(line)) {
        currentOutput = output;
      }
      isCollectingModes = (currentOutput === output);
      continue;
    }

    if (!isCollectingModes) continue;
    if (!/^\s+\d+x\d+/.test(line)) continue;

    const modeMatch = line.match(/^\s+(\d+x\d+)/);
    if (!modeMatch) continue;
    const mode = modeMatch[1];
    modes.push(mode);
    if (line.includes('*')) currentMode = mode;
  }

  const output = currentOutput || fallbackOutput;
  if (!output || modes.length === 0) return null;

  return {
    output,
    currentMode: currentMode || modes[0],
    modes: Array.from(new Set(modes)),
  };
}

function getDisplayState() {
  return new Promise((resolve) => {
    execFile('xrandr', ['--query'], { timeout: 4000 }, (error, stdout) => {
      if (error) {
        resolve(null);
        return;
      }
      resolve(parseDisplayState(stdout));
    });
  });
}

function setDisplayMode(mode) {
  return new Promise(async (resolve) => {
    const display = await getDisplayState();
    if (!display || !display.output || !display.modes.includes(mode)) {
      resolve({ ok: false, mode, output: display?.output });
      return;
    }

    execFile('xrandr', ['--output', display.output, '--mode', mode], { timeout: 5000 }, (error) => {
      if (error) {
        resolve({ ok: false, mode, output: display.output });
        return;
      }
      resolve({ ok: true, mode, output: display.output });
    });
  });
}

function spawnFirstAvailable(candidates) {
  return new Promise((resolve) => {
    const tryNext = (index) => {
      if (index >= candidates.length) {
        resolve({ ok: false, method: 'none' });
        return;
      }
      const candidate = candidates[index];
      let child;
      try {
        child = spawn(candidate.command, candidate.args || [], {
          detached: true,
          stdio: 'ignore',
        });
      } catch (_error) {
        tryNext(index + 1);
        return;
      }

      child.once('error', () => tryNext(index + 1));
      child.once('spawn', () => {
        child.unref();
        resolve({ ok: true, method: candidate.name });
      });
    };
    tryNext(0);
  });
}

function formatBytes(bytes) {
  const value = Number(bytes) || 0;
  if (value <= 0) return 'Unknown';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let unit = 0;
  let size = value;
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit += 1;
  }
  return `${size >= 100 ? Math.round(size) : size.toFixed(size >= 10 ? 1 : 2)} ${units[unit]}`;
}

function parseInstallerDisks(payload) {
  const data = JSON.parse(String(payload || '{}'));
  const devices = Array.isArray(data.blockdevices) ? data.blockdevices : [];
  return devices
    .filter((device) => device.type === 'disk')
    .map((device) => ({
      name: String(device.name || ''),
      path: String(device.path || ''),
      sizeBytes: Number(device.size || 0),
      sizeLabel: formatBytes(device.size),
      model: String(device.model || '').trim(),
      vendor: String(device.vendor || '').trim(),
      transport: String(device.tran || '').trim(),
      removable: Boolean(Number(device.rm || 0)),
      hotplug: Boolean(Number(device.hotplug || 0)),
      mountpoints: [device.mountpoint].filter(Boolean).map(String),
      children: Array.isArray(device.children)
        ? device.children.map((child) => ({
            name: String(child.name || ''),
            path: String(child.path || ''),
            sizeBytes: Number(child.size || 0),
            sizeLabel: formatBytes(child.size),
            fstype: String(child.fstype || ''),
            mountpoint: String(child.mountpoint || ''),
          }))
        : [],
    }));
}

function runInstallerJson(args) {
  return new Promise((resolve, reject) => {
    execFile(INSTALLER_SCRIPT, args, { timeout: 5000 }, (error, stdout) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(String(stdout || '').trim());
    });
  });
}

async function getInstallerDisks() {
  try {
    const payload = await runInstallerJson(['list-disks']);
    return parseInstallerDisks(payload);
  } catch (_error) {
    return [];
  }
}

async function previewInstallerPlan(diskPath, mode) {
  try {
    const payload = await runInstallerJson(['preview-plan', diskPath, mode]);
    return JSON.parse(payload);
  } catch (_error) {
    return {
      ok: false,
      mode,
      targetDisk: diskPath,
      operations: [],
      error: 'Unable to build installer plan',
    };
  }
}

async function applyInstallerPlan(diskPath, mode, confirmation) {
  try {
    const payload = await new Promise((resolve, reject) => {
      execFile('sudo', [INSTALLER_SCRIPT, 'apply-plan', diskPath, mode, confirmation], { timeout: 60 * 60 * 1000 }, (error, stdout) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(String(stdout || '').trim());
      });
    });
    return JSON.parse(payload);
  } catch (_error) {
    return {
      ok: false,
      mode,
      targetDisk: diskPath,
      error: 'Unable to apply installer plan',
    };
  }
}

ipcMain.handle('tornlinux:launchSoundSettings', async () => {
  return spawnFirstAvailable([
    { name: 'pavucontrol', command: 'pavucontrol', args: [] },
  ]);
});

ipcMain.handle('tornlinux:launchNetworkSettings', async () => {
  return spawnFirstAvailable([
    { name: 'nm-connection-editor', command: 'nm-connection-editor', args: [] },
  ]);
});

ipcMain.handle('tornlinux:getNetworkStatus', async () => getNetworkStatus());
ipcMain.handle('tornlinux:getDisplayState', async () => getDisplayState());
ipcMain.handle('tornlinux:setDisplayMode', async (_event, mode) => setDisplayMode(String(mode || '').trim()));
ipcMain.handle('tornlinux:powerAction', async (_event, action) => {
  const normalized = String(action || '').trim().toLowerCase();
  if (normalized === 'reload') {
    const win = getPrimaryWindow();
    if (!win) return { ok: false, action: 'reload', method: 'window-missing' };
    win.webContents.reloadIgnoringCache();
    return { ok: true, action: 'reload', method: 'electron-reload' };
  }

  if (normalized === 'restart') {
    const result = await spawnFirstAvailable([
      { name: 'systemctl-reboot', command: 'systemctl', args: ['reboot'] },
      { name: 'reboot', command: 'reboot', args: [] },
    ]);
    return { ...result, action: 'restart' };
  }

  if (normalized === 'shutdown') {
    const result = await spawnFirstAvailable([
      { name: 'systemctl-poweroff', command: 'systemctl', args: ['poweroff'] },
      { name: 'poweroff', command: 'poweroff', args: [] },
    ]);
    return { ...result, action: 'shutdown' };
  }

  return { ok: false, action: normalized || 'reload', method: 'unsupported' };
});

ipcMain.handle('tornlinux:launchBluetoothSettings', async () => {
  return spawnFirstAvailable([
    { name: 'blueman-manager', command: 'blueman-manager', args: [] },
  ]);
});

ipcMain.handle('tornlinux:getInstallerDisks', async () => getInstallerDisks());
ipcMain.handle('tornlinux:previewInstallerPlan', async (_event, diskPath, mode) => {
  return previewInstallerPlan(String(diskPath || '').trim(), String(mode || 'auto').trim());
});
ipcMain.handle('tornlinux:applyInstallerPlan', async (_event, diskPath, mode, confirmation) => {
  return applyInstallerPlan(
    String(diskPath || '').trim(),
    String(mode || 'auto').trim(),
    String(confirmation || '')
  );
});

ipcMain.handle('tornlinux:getSystemVolume', async () => getSystemVolume());
ipcMain.handle('tornlinux:setSystemVolume', async (_event, value) => setSystemVolume(value));
