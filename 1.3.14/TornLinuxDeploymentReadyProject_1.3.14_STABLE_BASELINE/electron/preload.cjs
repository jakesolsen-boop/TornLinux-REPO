const { contextBridge, ipcRenderer } = require('electron');
const { IPC_CHANNELS } = require('./runtime/ipc.cjs');

contextBridge.exposeInMainWorld('tornlinux', {
  getSettings: () => ipcRenderer.invoke(IPC_CHANNELS.GET_SETTINGS),
  setSettings: (partial) => ipcRenderer.invoke(IPC_CHANNELS.SET_SETTINGS, partial),
  toggleLayout: () => ipcRenderer.invoke(IPC_CHANNELS.TOGGLE_LAYOUT),
  setLayout: (mode) => ipcRenderer.invoke(IPC_CHANNELS.SET_LAYOUT, mode),
  toggleTornStats: () => ipcRenderer.invoke(IPC_CHANNELS.TOGGLE_TORNSTATS),
  openSettings: () => ipcRenderer.invoke(IPC_CHANNELS.OPEN_SETTINGS),
  log: (level, message, meta) => ipcRenderer.invoke(IPC_CHANNELS.LOG, level, message, meta),
  getConfigStatus: () => ipcRenderer.invoke(IPC_CHANNELS.GET_CONFIG_STATUS),
  getConfig: () => ipcRenderer.invoke(IPC_CHANNELS.GET_CONFIG),
  saveConfig: (config) => ipcRenderer.invoke(IPC_CHANNELS.SAVE_CONFIG, config),
  getUnifiedState: () => ipcRenderer.invoke(IPC_CHANNELS.GET_UNIFIED_STATE),
});
