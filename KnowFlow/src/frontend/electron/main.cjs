const { app, BrowserWindow, shell } = require('electron');
const path = require('path');

// 确保应用只运行一个实例
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // 当第二个实例被启动时，聚焦到主窗口
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  // 主窗口
  let mainWindow;

  function createWindow() {
    mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      webPreferences: {
        preload: path.join(__dirname, '../dist/assets/preload.js'),
        contextIsolation: true,
        nodeIntegration: false,
        defaultEncoding: 'UTF-8'
      }
    });

    // 加载应用
    const loadUrl = () => {
      mainWindow.loadURL('http://localhost:5175')
        .catch((error) => {
          console.error('Failed to load URL:', error);
          // 重试加载
          setTimeout(loadUrl, 1000);
        });
    };
    
    loadUrl();

    // 打开开发者工具
    // mainWindow.webContents.openDevTools();

    mainWindow.on('closed', function () {
      mainWindow = null;
    });
  }

  app.whenReady().then(() => {
    // 设置 CSP 头部
    const { session } = require('electron');
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          // 开发环境宽松策略：允许本地资源、Vite 热更新 websocket、unsafe-eval（用于 HMR）
          'Content-Security-Policy': [
            "default-src 'self'; " +
            "script-src 'self' 'unsafe-eval' 'unsafe-inline' http://localhost:* ws://localhost:*; " +
            "style-src 'self' 'unsafe-inline'; " +
            "img-src 'self' data: blob:; " +
            "connect-src 'self' http://localhost:* ws://localhost:*"
          ]
        }
      });
    });

    createWindow();
  });

  app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
  });

  app.on('activate', function () {
    if (mainWindow === null) createWindow();
  });


}