const { contextBridge, ipcRenderer } = require('electron');

// NanoleafAPI for renderer process. Can be used with the global variable "window".
// window.nanoleafAPI
contextBridge.exposeInMainWorld('nanoleafAPI', {
  findDevices: () => ipcRenderer.invoke('findDevices')
});