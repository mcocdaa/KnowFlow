import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, within, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CategoriesPage from '../../src/pages/CategoriesPage';
import { api } from '../../src/services/api';
import { renderWithProviders } from '../utils/renderWithProviders';
import type { CategoryDefinition } from '../../src/types';

vi.mock('../../src/services/api', async () => {
  const { createApiMock } = await import('../utils/mockApi');
  const mockApi = createApiMock();
  return { API_BASE_URL: '/api/v1', api: mockApi, default: mockApi };
});

const categories: CategoryDefinition[] = [
  { name: 'inner_category', title: '内置分类', parent_name: null, is_builtin: true },
  { name: 'custom_category', title: '自定义分类', parent_name: 'inner_category', is_builtin: false },
];

const renderPage = () => renderWithProviders(<CategoriesPage />);

describe('CategoriesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.fetchCategories).mockResolvedValue(categories);
  });

  it('renders categories and protects builtin ones', async () => {
    renderPage();

    expect(await screen.findAllByText('内置分类')).toHaveLength(2);
    expect(screen.getByText('自定义分类')).toBeInTheDocument();
    expect(screen.getByText('内置')).toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument();

    const deleteButtons = screen.getAllByRole('button', { name: /删\s*除/ });
    expect(deleteButtons[0]).toBeDisabled();
    expect(deleteButtons[1]).toBeEnabled();
    expect(screen.getAllByRole('button', { name: /编\s*辑/ })[0]).toBeDisabled();
  });

  it('creates a category and reloads', async () => {
    const user = userEvent.setup();
    vi.mocked(api.createCategory).mockResolvedValue({
      name: 'new_category',
      title: '新分类',
      parent_name: null,
      is_builtin: false,
    });

    renderPage();
    await screen.findAllByText('内置分类');

    await user.click(screen.getByRole('button', { name: /新建分类/ }));
    const dialog = await screen.findByRole('dialog');
    await user.type(within(dialog).getByLabelText('标识'), 'new_category');
    await user.type(within(dialog).getByLabelText('名称'), '新分类');
    await user.click(within(dialog).getByRole('button', { name: /保\s*存/ }));

    await waitFor(() =>
      expect(api.createCategory).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'new_category', title: '新分类' }),
      ),
    );
    await waitFor(() => expect(api.fetchCategories).toHaveBeenCalledTimes(2));
  });

  it('edits a category with prefilled values', async () => {
    const user = userEvent.setup();
    vi.mocked(api.updateCategory).mockResolvedValue({
      ...categories[1],
      title: '改名后',
    });

    renderPage();
    await screen.findByText('自定义分类');

    await user.click(screen.getAllByRole('button', { name: /编\s*辑/ })[1]);
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByLabelText('标识')).toHaveValue('custom_category');
    expect(within(dialog).getByLabelText('名称')).toHaveValue('自定义分类');

    await user.clear(within(dialog).getByLabelText('名称'));
    await user.type(within(dialog).getByLabelText('名称'), '改名后');
    await user.click(within(dialog).getByRole('button', { name: /保\s*存/ }));

    await waitFor(() =>
      expect(api.updateCategory).toHaveBeenCalledWith(
        'custom_category',
        expect.objectContaining({ title: '改名后' }),
      ),
    );
  });

  it('surfaces backend delete errors without reloading', async () => {
    vi.mocked(api.deleteCategory).mockRejectedValue(
      new Error('cannot delete category with existing children'),
    );

    renderPage();
    await screen.findByText('自定义分类');

    fireEvent.click(screen.getAllByRole('button', { name: /删\s*除/ })[1]);
    expect(await screen.findByText('删除这个分类？')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /确\s*定/ }));

    await waitFor(() => expect(api.deleteCategory).toHaveBeenCalledWith('custom_category'));
    expect(api.fetchCategories).toHaveBeenCalledTimes(1);
  });

  it('shows an error state and retries', async () => {
    const user = userEvent.setup();
    vi.mocked(api.fetchCategories)
      .mockRejectedValueOnce(new Error('网络错误'))
      .mockResolvedValueOnce(categories);

    renderPage();

    expect(await screen.findByText(/加载失败/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /重\s*试/ }));
    expect(await screen.findAllByText('内置分类')).toHaveLength(2);
  });
});
