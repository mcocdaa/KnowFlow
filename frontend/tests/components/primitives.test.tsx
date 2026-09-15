import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BrandLogo from '../../src/components/common/BrandLogo';
import FileIcon from '../../src/components/common/FileIcon';
import StatePlaceholder from '../../src/components/common/StatePlaceholder';

describe('BrandLogo', () => {
  it('renders an inline SVG mark', () => {
    const { container } = render(<BrandLogo />);
    expect(screen.getByRole('img', { name: 'KnowFlow' })).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});

describe('FileIcon', () => {
  it.each([
    ['image/png', 'file-image'],
    ['video/mp4', 'video-camera'],
    ['application/pdf', 'file-pdf'],
    ['text/plain', 'file-text'],
    ['text/markdown', 'file-text'],
    ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'file-excel'],
    ['application/zip', 'file-zip'],
  ])('maps %s to %s', (fileType, label) => {
    render(<FileIcon fileType={fileType} />);
    expect(screen.getByRole('img', { name: label })).toBeInTheDocument();
  });

  it('falls back to the generic file icon', () => {
    render(<FileIcon />);
    expect(screen.getByRole('img', { name: 'file' })).toBeInTheDocument();
  });
});

describe('StatePlaceholder', () => {
  it('renders the empty state with a description', () => {
    render(<StatePlaceholder variant="empty" title="暂无数据" />);
    expect(screen.getByText('暂无数据')).toBeInTheDocument();
  });

  it('renders the error state and triggers retry', async () => {
    const onRetry = vi.fn();
    render(<StatePlaceholder variant="error" description="加载失败" onRetry={onRetry} />);
    await userEvent.click(screen.getByRole('button', { name: /重\s*试/ }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('renders a skeleton while loading', () => {
    const { container } = render(<StatePlaceholder variant="loading" />);
    expect(container.querySelector('.ant-skeleton')).toBeInTheDocument();
  });
});
