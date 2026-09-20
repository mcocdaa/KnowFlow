import { API_BASE_URL } from '../services/api';

export const getFileUrl = (filePath: string | unknown): string => {
  if (typeof filePath !== 'string' || !filePath.trim()) return '';
  const trimmed = filePath.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('blob:')) {
    return trimmed;
  }
  const basename = trimmed.replace(/\\/g, '/').split('/').pop() || '';
  return `${API_BASE_URL}/uploads/${encodeURIComponent(basename)}`;
};

export const getFileExtension = (filePath: string | unknown): string => {
  if (typeof filePath !== 'string' || !filePath.trim()) return '';
  const basename = filePath.replace(/\\/g, '/').split('/').pop() || '';
  const dotIndex = basename.lastIndexOf('.');
  if (dotIndex === -1) return '';
  return basename.slice(dotIndex + 1).toLowerCase();
};

export const detectPreviewType = (
  fileType?: string | unknown,
  filePath?: string | unknown,
): 'pdf' | 'markdown' | 'code' | 'image' | 'video' | 'audio' | 'text' | 'unknown' => {
  const mime = typeof fileType === 'string' ? fileType.toLowerCase() : '';
  const ext = getFileExtension(filePath);

  if (mime.includes('pdf') || ext === 'pdf') return 'pdf';
  if (mime.includes('markdown') || ext === 'md' || ext === 'markdown') return 'markdown';
  if (
    mime.includes('javascript') ||
    mime.includes('typescript') ||
    mime.includes('json') ||
    mime.includes('html') ||
    mime.includes('css') ||
    mime.includes('python') ||
    ['js', 'jsx', 'ts', 'tsx', 'py', 'json', 'yaml', 'yml', 'html', 'css', 'sql', 'sh', 'bash', 'go', 'rs', 'java', 'c', 'cpp'].includes(ext)
  ) {
    return 'code';
  }
  if (mime === 'image' || mime.startsWith('image/') || ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext)) return 'image';
  if (mime === 'video' || mime.startsWith('video/') || ['mp4', 'webm', 'ogg', 'mov'].includes(ext)) return 'video';
  if (mime === 'audio' || mime.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'm4a'].includes(ext)) return 'audio';
  if (mime === 'text' || mime.startsWith('text/') || ext === 'txt' || ext === 'log') return 'text';
  return 'unknown';
};
