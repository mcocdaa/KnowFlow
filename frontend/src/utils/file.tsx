import { FileOutlined, FileImageOutlined, FilePdfOutlined, FileTextOutlined, VideoCameraOutlined } from '@ant-design/icons';

export const getFileIcon = (fileType?: string): React.ReactNode => {
  if (!fileType) return <FileOutlined />;
  if (fileType.includes('image')) return <FileImageOutlined />;
  if (fileType.includes('video')) return <VideoCameraOutlined />;
  if (fileType.includes('pdf')) return <FilePdfOutlined />;
  if (fileType.includes('text') || fileType.includes('markdown')) return <FileTextOutlined />;
  return <FileOutlined />;
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};
