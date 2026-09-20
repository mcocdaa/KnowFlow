import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ItemCardGrid } from '../../src/components/library/ItemCardGrid';
import { renderWithProviders } from '../utils/renderWithProviders';
import type { KnowledgeItem } from '../../src/types';

describe('ItemCardGrid', () => {
  const sampleItems: KnowledgeItem[] = [
    {
      id: 'item-1',
      name: '架构设计说明书.md',
      keyValues: {
        file_path: '/api/v1/uploads/arch.md',
        file_type: 'markdown',
        rating: 5,
        tags: ['架构', '核心'],
        category_name: 'tech',
      },
      createdAt: '2026-09-20T10:00:00',
      updatedAt: '2026-09-20T10:00:00',
    },
  ];

  it('renders item cards with name, category, and tags', () => {
    renderWithProviders(
      <ItemCardGrid
        items={sampleItems}
        total={1}
        page={1}
        pageSize={20}
        categories={[{ name: 'tech', title: '技术分类', parent_name: null, is_builtin: false }]}
        onPageChange={vi.fn()}
        onOpen={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByText('架构设计说明书.md')).toBeInTheDocument();
    expect(screen.getByText('技术分类')).toBeInTheDocument();
    expect(screen.getByText('架构')).toBeInTheDocument();
    expect(screen.getByText('核心')).toBeInTheDocument();
  });

  it('handles item click and edit callbacks', async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    const onEdit = vi.fn();

    renderWithProviders(
      <ItemCardGrid
        items={sampleItems}
        total={1}
        page={1}
        pageSize={20}
        onPageChange={vi.fn()}
        onOpen={onOpen}
        onEdit={onEdit}
        onDelete={vi.fn()}
      />,
    );

    await user.click(screen.getByText('架构设计说明书.md'));
    expect(onOpen).toHaveBeenCalledWith(sampleItems[0]);

    const editBtn = screen.getByLabelText('编辑');
    await user.click(editBtn);
    expect(onEdit).toHaveBeenCalledWith(sampleItems[0]);
  });

  it('renders empty description when items array is empty', () => {
    renderWithProviders(
      <ItemCardGrid
        items={[]}
        total={0}
        page={1}
        pageSize={20}
        onPageChange={vi.fn()}
        onOpen={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByText('暂无匹配知识记录')).toBeInTheDocument();
  });
});
