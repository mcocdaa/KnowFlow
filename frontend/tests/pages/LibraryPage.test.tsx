import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../src/App';
import { api } from '../../src/services/api';
import { renderWithProviders, LocationProbe } from '../utils/renderWithProviders';
import { deferred } from '../utils/deferred';
import type { KnowledgeItem, PagedItems } from '../../src/types';

vi.mock('../../src/services/api', () => {
  const mockApi = {
    searchItems: vi.fn(),
    fetchKeys: vi.fn().mockResolvedValue([]),
    fetchCategories: vi.fn().mockResolvedValue([]),
    deleteItem: vi.fn(),
  };
  return { api: mockApi, default: mockApi };
});

const item1: KnowledgeItem = {
  id: '1',
  name: '部署手册',
  keyValues: { name: '部署手册', file_type: 'text/markdown', rating: 5 },
  createdAt: '2026-09-01T08:00:00',
  updatedAt: '2026-09-02T09:30:00',
};

const item2: KnowledgeItem = {
  id: '2',
  name: '架构图',
  keyValues: { name: '架构图', file_type: 'image/png' },
  createdAt: '2026-09-01T08:00:00',
  updatedAt: '2026-09-01T08:00:00',
};

const paged = (items: KnowledgeItem[], overrides: Partial<PagedItems> = {}): PagedItems => ({
  items,
  total: items.length,
  page: 1,
  pageSize: 20,
  totalPages: 1,
  ...overrides,
});

const renderLibrary = (route = '/library') =>
  renderWithProviders(
    <>
      <App />
      <LocationProbe />
    </>,
    { route },
  );

describe('LibraryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.fetchKeys).mockResolvedValue([]);
    vi.mocked(api.fetchCategories).mockResolvedValue([]);
    vi.mocked(api.deleteItem).mockResolvedValue(undefined);
  });

  it('loads the first page with default params', async () => {
    vi.mocked(api.searchItems).mockResolvedValue(paged([item1, item2]));

    renderLibrary();

    expect(await screen.findByText('部署手册')).toBeInTheDocument();
    expect(screen.getByText('架构图')).toBeInTheDocument();
    expect(api.searchItems).toHaveBeenCalledWith({
      q: '',
      key: '',
      keyValue: '',
      sort: 'recent',
      page: 1,
      pageSize: 20,
    });
  });

  it('hydrates the query from the URL', async () => {
    vi.mocked(api.searchItems).mockResolvedValue(paged([]));

    renderLibrary('/library?q=abc&sort=name&page=2&page_size=50&key=rating&key_value=5');

    await waitFor(() =>
      expect(api.searchItems).toHaveBeenCalledWith({
        q: 'abc',
        key: 'rating',
        keyValue: '5',
        sort: 'name',
        page: 2,
        pageSize: 50,
      }),
    );
  });

  it('debounces the search input and syncs the URL', async () => {
    const user = userEvent.setup();
    vi.mocked(api.searchItems).mockResolvedValue(paged([]));

    renderLibrary();
    await screen.findByText(/暂无知识记录/);

    await user.type(screen.getByPlaceholderText('搜索名称或任意属性值'), '部署');

    await waitFor(
      () => expect(api.searchItems).toHaveBeenLastCalledWith(expect.objectContaining({ q: '部署', page: 1 })),
      { timeout: 2000 },
    );
    await waitFor(() =>
      expect(new URLSearchParams(screen.getByTestId('location-search').textContent ?? '').get('q')).toBe('部署'),
    );
  });

  it('changes sorting through the sort select', async () => {
    const user = userEvent.setup();
    vi.mocked(api.searchItems).mockResolvedValue(paged([item1]));

    renderLibrary();
    await screen.findByText('部署手册');

    const sortWrapper = screen.getByTestId('sort-select');
    await user.click(within(sortWrapper).getByRole('combobox'));
    await user.click(await screen.findByTitle('名称'));

    await waitFor(() => expect(api.searchItems).toHaveBeenLastCalledWith(expect.objectContaining({ sort: 'name' })));
  });

  it('changes the page through the pagination', async () => {
    const user = userEvent.setup();
    vi.mocked(api.searchItems).mockResolvedValue(paged([item1], { total: 42, totalPages: 3 }));

    renderLibrary();
    await screen.findByText('部署手册');

    await user.click(screen.getByTitle('2'));

    await waitFor(() => expect(api.searchItems).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2 })));
  });

  it('shows an error state with retry', async () => {
    const user = userEvent.setup();
    vi.mocked(api.searchItems)
      .mockRejectedValueOnce(new Error('后端暂时不可用'))
      .mockResolvedValueOnce(paged([item1]));

    renderLibrary();

    expect(await screen.findByText(/加载失败/)).toBeInTheDocument();
    expect(screen.getByText('后端暂时不可用')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /重\s*试/ }));

    expect(await screen.findByText('部署手册')).toBeInTheDocument();
  });

  it('shows an empty state when there is nothing to list', async () => {
    vi.mocked(api.searchItems).mockResolvedValue(paged([]));

    renderLibrary();

    expect(await screen.findByText(/暂无知识记录/)).toBeInTheDocument();
  });

  it('exposes a guarded delete action with the file-removal warning', async () => {
    const user = userEvent.setup();
    vi.mocked(api.searchItems).mockResolvedValue(paged([item1, item2]));

    renderLibrary();
    await screen.findByText('部署手册');

    expect(screen.getAllByLabelText('删除')).toHaveLength(2);
    await user.click(screen.getAllByLabelText('删除')[0]);
    expect(await screen.findByText('仅删除记录，不会删除已上传的文件。')).toBeInTheDocument();
  });

  it('ignores out-of-order responses', async () => {
    const user = userEvent.setup();
    const slow = deferred<PagedItems>();
    const fast = deferred<PagedItems>();
    vi.mocked(api.searchItems).mockReturnValueOnce(slow.promise).mockReturnValueOnce(fast.promise);

    renderLibrary();
    await user.type(screen.getByPlaceholderText('搜索名称或任意属性值'), 'a');
    await waitFor(() => expect(api.searchItems).toHaveBeenCalledTimes(2), { timeout: 2000 });

    fast.resolve(paged([item2]));
    expect(await screen.findByText('架构图')).toBeInTheDocument();

    slow.resolve(paged([item1]));
    await waitFor(() => expect(screen.queryByText('部署手册')).not.toBeInTheDocument());
    expect(screen.getByText('架构图')).toBeInTheDocument();
  });
});
