import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FacetFilterChips } from '../../src/components/library/FacetFilterChips';
import { renderWithProviders } from '../utils/renderWithProviders';

describe('FacetFilterChips', () => {
  const categories = [
    { name: 'tech', title: '技术分类', parent_name: null, is_builtin: false },
  ];
  const keys = [
    {
      name: 'rating',
      title: '星级',
      value_type: 'number' as const,
      default_value: 0,
      description: '',
      category_name: 'basic',
      is_required: false,
      is_visible: true,
      plugin_name: '',
      delete_with_plugin: false,
      is_public: true,
      is_private: false,
      created_at: '',
      updated_at: '',
    },
  ];

  it('renders rating and type chips, and responds to click', async () => {
    const user = userEvent.setup();
    const onKeyFilterChange = vi.fn();
    const onResetAll = vi.fn();

    renderWithProviders(
      <FacetFilterChips
        params={{}}
        selectedCategory={null}
        categories={categories}
        keys={keys}
        onSelectCategory={vi.fn()}
        onKeyFilterChange={onKeyFilterChange}
        onClearSearch={vi.fn()}
        onResetAll={onResetAll}
      />,
    );

    expect(screen.getByText('快捷过滤:')).toBeInTheDocument();
    expect(screen.getByText('4星及以上')).toBeInTheDocument();
    expect(screen.getByText('PDF')).toBeInTheDocument();

    await user.click(screen.getByText('4星及以上'));
    expect(onKeyFilterChange).toHaveBeenCalledWith('rating', '>=4');

    await user.click(screen.getByText('PDF'));
    expect(onKeyFilterChange).toHaveBeenCalledWith('file_type', 'pdf');
  });

  it('renders active filter tag and reset button', async () => {
    const user = userEvent.setup();
    const onResetAll = vi.fn();
    const onSelectCategory = vi.fn();

    renderWithProviders(
      <FacetFilterChips
        params={{ key: 'rating', keyValue: '>=4' }}
        selectedCategory="tech"
        categories={categories}
        keys={keys}
        onSelectCategory={onSelectCategory}
        onKeyFilterChange={vi.fn()}
        onClearSearch={vi.fn()}
        onResetAll={onResetAll}
      />,
    );

    expect(screen.getByText('分类: 技术分类')).toBeInTheDocument();
    expect(screen.getByText('重置全部')).toBeInTheDocument();

    await user.click(screen.getByText('重置全部'));
    expect(onResetAll).toHaveBeenCalledTimes(1);
  });
});
