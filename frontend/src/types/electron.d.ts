// 扩展Window接口，添加 Electron preload 暴露的 API
interface Window {
  knowflow?: {
    apiBase: string;
    showItemInFolder: (filePath: string) => Promise<void>;
  };
}
