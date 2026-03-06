import { contextBridge, shell } from 'electron';
import path from 'path';

// 向渲染进程暴露受限制的 API
contextBridge.exposeInMainWorld('electronAPI', {
  openFileLocation: (filePath: string) => {
    const resolvedPath = path.resolve(filePath);
    shell.showItemInFolder(resolvedPath); // 用 Electron API 打开文件位置
  }
});
