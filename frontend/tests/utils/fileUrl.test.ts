import { describe, it, expect } from 'vitest';
import { detectPreviewType, getFileExtension, getFileUrl } from '../../src/utils/fileUrl';

describe('fileUrl utility', () => {
  it('getFileUrl resolves relative and absolute paths', () => {
    expect(getFileUrl(undefined)).toBe('');
    expect(getFileUrl('')).toBe('');
    expect(getFileUrl('https://example.com/test.pdf')).toBe('https://example.com/test.pdf');
    expect(getFileUrl('/api/v1/uploads/test.pdf')).toBe('/api/v1/uploads/test.pdf');
    expect(getFileUrl('uploads/doc.md')).toBe('/api/v1/uploads/doc.md');
  });

  it('getFileExtension extracts clean lowercased extension', () => {
    expect(getFileExtension(undefined)).toBe('');
    expect(getFileExtension('')).toBe('');
    expect(getFileExtension('readme.md')).toBe('md');
    expect(getFileExtension('REPORT.PDF')).toBe('pdf');
    expect(getFileExtension('archive.tar.gz')).toBe('gz');
    expect(getFileExtension('noextension')).toBe('');
  });

  it('detectPreviewType detects media types by fileType and extension', () => {
    expect(detectPreviewType('pdf', undefined)).toBe('pdf');
    expect(detectPreviewType(undefined, 'manual.PDF')).toBe('pdf');

    expect(detectPreviewType('markdown', undefined)).toBe('markdown');
    expect(detectPreviewType(undefined, 'doc.md')).toBe('markdown');

    expect(detectPreviewType('image', undefined)).toBe('image');
    expect(detectPreviewType(undefined, 'photo.png')).toBe('image');
    expect(detectPreviewType(undefined, 'diagram.svg')).toBe('image');

    expect(detectPreviewType(undefined, 'script.py')).toBe('code');
    expect(detectPreviewType(undefined, 'config.json')).toBe('code');
    expect(detectPreviewType(undefined, 'app.tsx')).toBe('code');

    expect(detectPreviewType(undefined, 'notes.txt')).toBe('text');
  });
});
