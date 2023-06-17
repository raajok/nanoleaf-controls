const { contextBridge, ipcRenderer } = require('electron');

// NanoleafAPI for renderer process. Can be used with the global variable "window".
// window.nanoleafAPI
contextBridge.exposeInMainWorld('nanoleafAPI', {
  findDevices: () => ipcRenderer.invoke('findDevices'),
  authenticationToken: (ip) => ipcRenderer.invoke('authenticationToken', ip),
  setWeatherEffect: (ip, token, city) => ipcRenderer.invoke('weatherEffect', ip, token, city)
});