const { contextBridge, ipcRenderer } = require('electron');

const API_BASE_ARG = '--knowflow-api-base=';
const apiBase = (process.argv.find((arg) => arg.startsWith(API_BASE_ARG)) || '').slice(API_BASE_ARG.length);

contextBridge.exposeInMainWorld('knowflow', {
  apiBase,
  showItemInFolder: (filePath) => ipcRenderer.invoke('show-item-in-folder', filePath),
});
