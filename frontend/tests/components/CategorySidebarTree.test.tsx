import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CategorySidebarTree } from '../../src/components/library/CategorySidebarTree';
import { renderWithProviders } from '../utils/renderWithProviders';

describe('CategorySidebarTree', () => {
  const categories = [
    { name: 'backend', title: '后端架构', parent_name: null, is_builtin: false },
    { name: 'algo', title: '算法模型', parent_name: null, is_builtin: false },
  ];

  it('renders root "全部知识", category titles, and counts', () => {
    renderWithProviders(
      <CategorySidebarTree
        categories={categories}
        selectedCategory={null}
        onSelectCategory={vi.fn()}
        itemCounts={{ backend: 3, algo: 1 }}
        totalCount={4}
      />,
    );

    expect(screen.getByText('全部知识')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('后端架构')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('算法模型')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText(/拖拽文件可直接归档至分类/)).toBeInTheDocument();
  });

  it('triggers onSelectCategory on node click', async () => {
    const user = userEvent.setup();
    const onSelectCategory = vi.fn();

    renderWithProviders(
      <CategorySidebarTree
        categories={categories}
        selectedCategory="backend"
        onSelectCategory={onSelectCategory}
      />,
    );

    await user.click(screen.getByText('算法模型'));
    expect(onSelectCategory).toHaveBeenCalledWith('algo');

    await user.click(screen.getByText('全部知识'));
    expect(onSelectCategory).toHaveBeenCalledWith(null);
  });
});
