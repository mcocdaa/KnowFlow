const { app, BrowserWindow, shell, ipcMain, session } = require('electron');
const path = require('path');

const DEV_SERVER_URL = 'http://localhost:5177';
const LOAD_RETRY_MAX = 10;
const LOAD_RETRY_INTERVAL_MS = 1000;

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
  let loadRetryCount = 0;

  function createWindow() {
    mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      webPreferences: {
        preload: path.join(__dirname, 'preload.cjs'),
        contextIsolation: true,
        nodeIntegration: false,
        defaultEncoding: 'UTF-8'
      }
    });

    // 生产环境加载构建产物，开发环境加载 Vite dev server
    const loadApp = () => {
      if (app.isPackaged) {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
          .catch((error) => {
            console.error('Failed to load app:', error);
          });
        return;
      }

      mainWindow.loadURL(DEV_SERVER_URL)
        .catch((error) => {
          console.error('Failed to load URL:', error);
          if (loadRetryCount < LOAD_RETRY_MAX) {
            loadRetryCount += 1;
            setTimeout(loadApp, LOAD_RETRY_INTERVAL_MS);
          } else {
            console.error(`Vite dev server 未在 ${DEV_SERVER_URL} 启动，请在 frontend 目录运行 npm run dev`);
          }
        });
    };

    loadApp();

    // 打开开发者工具
    // mainWindow.webContents.openDevTools();

    mainWindow.on('closed', function () {
      mainWindow = null;
      loadRetryCount = 0;
    });
  }

  app.whenReady().then(() => {
    // 在资源管理器中显示文件
    ipcMain.handle('show-item-in-folder', (event, filePath) => {
      if (typeof filePath === 'string' && filePath) {
        shell.showItemInFolder(filePath);
      }
    });

    // 设置 CSP 头部
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'Content-Security-Policy': [
            "default-src 'self'; " +
            "script-src 'self' 'unsafe-eval' 'unsafe-inline' http://localhost:* ws://localhost:*; " +
            "style-src 'self' 'unsafe-inline'; " +
            "img-src 'self' data: blob:; " +
            "font-src 'self' data:; " +
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
