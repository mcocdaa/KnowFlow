// 扩展Window接口，添加electronAPI
interface Window {
  electronAPI?: {
    openFileLocation: (filePath: string) => void;
  };
}
