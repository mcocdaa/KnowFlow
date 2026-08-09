const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('knowflow', {
  showItemInFolder: (filePath) => ipcRenderer.invoke('show-item-in-folder', filePath),
});
