const { contextBridge, ipcRenderer } = require('electron')
// 将 ipcRenderer 注入到全局上下文中
contextBridge.exposeInMainWorld('ipcRenderer', {
    ...ipcRenderer,
    on: ipcRenderer.on.bind(ipcRenderer),
    removeListener: ipcRenderer.removeListener.bind(ipcRenderer),
  })