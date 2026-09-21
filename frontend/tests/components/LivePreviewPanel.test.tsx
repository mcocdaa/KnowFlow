import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LivePreviewPanel } from '../../src/components/library/LivePreviewPanel';
import { renderWithProviders } from '../utils/renderWithProviders';
import type { KnowledgeItem } from '../../src/types';

describe('LivePreviewPanel', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders placeholder when no item is selected', () => {
    renderWithProviders(
      <LivePreviewPanel item={null} categories={[]} keys={[]} onClose={vi.fn()} />,
    );

    expect(screen.getByText('选择左侧知识项以快速预览与检查属性')).toBeInTheDocument();
  });

  it('renders item title, tags, and tabs when an item is selected', () => {
    const item: KnowledgeItem = {
      id: 'i-1',
      name: '测试文档.md',
      keyValues: {
        file_path: '/api/v1/uploads/test.md',
        file_type: 'markdown',
        rating: 5,
        category_name: 'docs',
      },
      createdAt: '2026-09-20T12:00:00',
      updatedAt: '2026-09-20T12:00:00',
    };

    renderWithProviders(
      <LivePreviewPanel
        item={item}
        categories={[{ name: 'docs', title: '文档分类', parent_name: null, is_builtin: false }]}
        keys={[]}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText('测试文档.md')).toBeInTheDocument();
    expect(screen.getByText('文档分类')).toBeInTheDocument();
    expect(screen.getByText('.MD')).toBeInTheDocument();
    expect(screen.getByText('实时极速预览')).toBeInTheDocument();
    expect(screen.getByText('属性与插件')).toBeInTheDocument();
  });

  it('switches between preview and attributes tab', async () => {
    const user = userEvent.setup();
    const item: KnowledgeItem = {
      id: 'i-1',
      name: '测试文档.md',
      keyValues: {
        file_path: '/api/v1/uploads/test.md',
        file_type: 'markdown',
      },
    };

    renderWithProviders(
      <LivePreviewPanel item={item} categories={[]} keys={[]} onClose={vi.fn()} />,
    );

    await user.click(screen.getByText('属性与插件'));
    expect(screen.getByText('创建时间')).toBeInTheDocument();
    expect(screen.getByText('更新时间')).toBeInTheDocument();
  });
});
