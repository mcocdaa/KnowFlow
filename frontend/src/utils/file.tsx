import { FileOutlined, FileImageOutlined, FilePdfOutlined, FileTextOutlined, VideoCameraOutlined } from '@ant-design/icons';

export const getFileIcon = (fileType?: string): React.ReactNode => {
  if (!fileType) return <FileOutlined />;
  if (fileType.includes('image')) return <FileImageOutlined />;
  if (fileType.includes('video')) return <VideoCameraOutlined />;
  if (fileType.includes('pdf')) return <FilePdfOutlined />;
  if (fileType.includes('text') || fileType.includes('markdown')) return <FileTextOutlined />;
  return <FileOutlined />;
};
