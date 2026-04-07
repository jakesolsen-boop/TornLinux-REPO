const { execFile } = require('child_process');
const { app, BrowserWindow, ipcMain, shell, Menu, session } = require('electron');
const path = require('node:path');
const { IPC_CHANNELS } = require('./runtime/ipc.cjs');
const { settingsStore } = require('./runtime/settings-store.cjs');
const { getConfigStatus, readConfig, writeConfig } = require('./runtime/config-store.cjs');
const { isAllowedEmbedUrl, isAllowedExternalUrl } = require('./runtime/webview-policy.cjs');
const { getUnifiedState } = require('./runtime/unified-state.cjs');

const { version: APP_VERSION } = require(path.join(__dirname, '..', 'package.json'));

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
  const win = new BrowserWindow({
    width: 1600,
    height: 980,
    minWidth: 1280,
    minHeight: 760,
    frame: false,
    fullscreen: false,
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
  return getUnifiedState(config.tornApiKey);
});



function spawnFirstAvailable(candidates) {
  return new Promise((resolve) => {
    const tryNext = (index) => {
      if (index >= candidates.length) {
        resolve({ ok: false, method: 'none' });
        return;
      }
      const candidate = candidates[index];
      execFile(candidate.command, candidate.args || [], { detached: true }, (error) => {
        if (error) {
          tryNext(index + 1);
          return;
        }
        resolve({ ok: true, method: candidate.name });
      });
    };
    tryNext(0);
  });
}

ipcMain.handle('tornlinux:launchSoundSettings', async () => {
  return spawnFirstAvailable([
    { name: 'pavucontrol', command: 'pavucontrol', args: [] },
    { name: 'xterm-alsamixer', command: 'xterm', args: ['-e', 'alsamixer'] }
  ]);
});

ipcMain.handle('tornlinux:launchNetworkSettings', async () => {
  return spawnFirstAvailable([
    { name: 'nm-connection-editor', command: 'nm-connection-editor', args: [] },
    { name: 'xterm-nmtui', command: 'xterm', args: ['-e', 'nmtui'] }
  ]);
});

