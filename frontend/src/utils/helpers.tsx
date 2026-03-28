import { openFileInExplorer, copyToClipboard } from './electron';
import { message } from 'antd';
import { Button } from 'antd';
import { CopyOutlined } from '@ant-design/icons';

export const openFileLocation = (filePath: string, fallbackToCopy: (path: string) => void): void => {
  if (!filePath) return;

  const isElectron = window.require && window.require?.('electron');

  if (isElectron) {
    try {
      openFileInExplorer(filePath);
    } catch (err) {
      console.error('Electron open failed:', err);
      fallbackToCopy(filePath);
    }
  } else {
    fallbackToCopy(filePath);
  }
};

export const createCopyFallback = () => (path: string) => {
  message.info({
    content: (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>文件路径: {path}</span>
        <Button
          type="link"
          size="small"
          icon={<CopyOutlined />}
          onClick={() => {
            copyToClipboard(path);
            message.success('路径已复制到剪贴板');
          }}
        >
          复制
        </Button>
      </div>
    ),
    duration: 5,
  });
};
