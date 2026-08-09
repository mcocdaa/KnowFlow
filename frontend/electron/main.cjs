const { app, BrowserWindow, shell, ipcMain, session } = require('electron');
const path = require('path');
const url = require('url');

const DEV_SERVER_URL = 'http://localhost:5177';
const LOAD_RETRY_MAX = 10;
const LOAD_RETRY_INTERVAL_MS = 1000;

// 生产环境后端 API 地址（通过 KNOWFLOW_API_URL 注入，默认空则使用同源/相对路径）
const API_URL = process.env.KNOWFLOW_API_URL || '';
const API_ORIGIN = API_URL ? url.parse(API_URL).origin : '';

// 确保应用只运行一个实例
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  // 主窗口
  let mainWindow;
  let loadRetryCount = 0;
  let loadRetryTimer = null;

  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // 当第二个实例被启动时，聚焦到主窗口
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  function createWindow() {
    mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      webPreferences: {
        preload: path.join(__dirname, 'preload.cjs'),
        contextIsolation: true,
        nodeIntegration: false,
        additionalArguments: API_URL ? [`--knowflow-api-base=${API_URL}`] : [],
      },
    });

    // 禁止渲染进程引导导航到外部站点
    mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
      const allowed = app.isPackaged
        ? navigationUrl.startsWith('file://')
        : navigationUrl.startsWith(DEV_SERVER_URL);
      if (!allowed) {
        event.preventDefault();
        shell.openExternal(navigationUrl);
      }
    });

    mainWindow.webContents.setWindowOpenHandler(({ url: targetUrl }) => {
      if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://')) {
        shell.openExternal(targetUrl);
      }
      return { action: 'deny' };
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
            loadRetryTimer = setTimeout(loadApp, LOAD_RETRY_INTERVAL_MS);
          } else {
            console.error(`Vite dev server 未在 ${DEV_SERVER_URL} 启动，请在 frontend 目录运行 npm run dev`);
          }
        });
    };

    loadApp();

    // 打开开发者工具
    // mainWindow.webContents.openDevTools();

    mainWindow.on('closed', function () {
      if (loadRetryTimer) {
        clearTimeout(loadRetryTimer);
        loadRetryTimer = null;
      }
      mainWindow = null;
      loadRetryCount = 0;
    });
  }

  function buildCsp() {
    if (app.isPackaged) {
      // 生产环境：收紧 CSP，仅允许自身与 API 来源
      const connectSources = ["'self'", API_ORIGIN].filter(Boolean).join(' ');
      return "default-src 'self'; " +
        "script-src 'self'; " +
        "style-src 'self' 'unsafe-inline'; " +
        "img-src 'self' data: blob:; " +
        "font-src 'self' data:; " +
        `connect-src ${connectSources}`;
    }
    // 开发环境：需要 Vite dev server / HMR
    return "default-src 'self'; " +
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' http://localhost:* ws://localhost:*; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: blob:; " +
      "font-src 'self' data:; " +
      "connect-src 'self' http://localhost:* ws://localhost:*";
  }

  app.whenReady().then(() => {
    // 在资源管理器中显示文件
    ipcMain.handle('show-item-in-folder', async (event, filePath) => {
      if (typeof filePath !== 'string' || !filePath.trim()) {
        throw new Error('invalid file path');
      }
      shell.showItemInFolder(filePath);
      return { ok: true };
    });

    // 设置 CSP 头部
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'Content-Security-Policy': [buildCsp()],
        },
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
