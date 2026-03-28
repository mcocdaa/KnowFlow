// 扩展Window接口，添加electron相关
interface Window {
  electronAPI?: {
    openFileLocation: (filePath: string) => void;
  };
  require?: (module: string) => any;
}
