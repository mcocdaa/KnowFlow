import type { ReactElement } from 'react';
import {
  FileExcelOutlined,
  FileImageOutlined,
  FileOutlined,
  FilePdfOutlined,
  FileTextOutlined,
  FileZipOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';

const fileIconFor = (fileType?: string): ReactElement => {
  const type = (fileType ?? '').toLowerCase();
  if (!type) return <FileOutlined />;
  if (type.includes('image')) return <FileImageOutlined />;
  if (type.includes('video')) return <VideoCameraOutlined />;
  if (type.includes('pdf')) return <FilePdfOutlined />;
  if (type.includes('text') || type.includes('markdown')) return <FileTextOutlined />;
  if (type.includes('excel') || type.includes('spreadsheet') || type.includes('csv'))
    return <FileExcelOutlined />;
  if (type.includes('zip') || type.includes('compressed') || type.includes('archive'))
    return <FileZipOutlined />;
  return <FileOutlined />;
};

interface FileIconProps {
  fileType?: string;
  style?: React.CSSProperties;
}

const FileIcon = ({ fileType, style }: FileIconProps) => {
  const icon = fileIconFor(fileType);
  return <span style={style}>{icon}</span>;
};

export default FileIcon;
