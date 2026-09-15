import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { Provider } from 'react-redux';
import { App as AntdApp } from 'antd';
import { useLibrary } from '../../src/hooks/useLibrary';
import { api } from '../../src/services/api';
import { createTestStore } from '../utils/renderWithProviders';
import type { KnowledgeItem, PagedItems } from '../../src/types';

vi.mock('../../src/services/api', () => {
  const mockApi = {
    searchItems: vi.fn(),
    deleteItem: vi.fn(),
  };
  return { api: mockApi, default: mockApi };
});

const item1: KnowledgeItem = { id: '1', name: '部署手册', keyValues: {}, updatedAt: '2026-09-02T09:30:00' };
const item2: KnowledgeItem = { id: '2', name: '架构图', keyValues: {}, updatedAt: '2026-09-01T08:00:00' };

const paged = (items: KnowledgeItem[], overrides: Partial<PagedItems> = {}): PagedItems => ({
  items,
  total: items.length,
  page: 1,
  pageSize: 20,
  totalPages: 1,
  ...overrides,
});

const createWrapper =
  (route: string) =>
  ({ children }: { children: ReactNode }) => (
    <AntdApp>
      <Provider store={createTestStore()}>
        <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
      </Provider>
    </AntdApp>
  );

describe('useLibrary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deletes an item and refetches the current page', async () => {
    vi.mocked(api.searchItems).mockResolvedValue(paged([item1, item2]));
    vi.mocked(api.deleteItem).mockResolvedValue(undefined);

    const { result } = renderHook(() => useLibrary(), { wrapper: createWrapper('/library') });
    await waitFor(() => expect(result.current.items).toHaveLength(2));

    await act(async () => {
      await result.current.removeItem('1');
    });

    expect(api.deleteItem).toHaveBeenCalledWith('1');
    await waitFor(() => expect(api.searchItems).toHaveBeenCalledTimes(2));
    expect(vi.mocked(api.searchItems).mock.calls[1][0]).toMatchObject({ page: 1 });
  });

  it('falls back one page when deleting the last item of a page', async () => {
    vi.mocked(api.searchItems).mockResolvedValue(paged([item1], { total: 21, page: 2, totalPages: 2 }));
    vi.mocked(api.deleteItem).mockResolvedValue(undefined);

    const { result } = renderHook(() => useLibrary(), { wrapper: createWrapper('/library?page=2') });
    await waitFor(() => expect(result.current.items).toHaveLength(1));
    expect(result.current.page).toBe(2);

    await act(async () => {
      await result.current.removeItem('1');
    });

    await waitFor(() =>
      expect(vi.mocked(api.searchItems).mock.calls.at(-1)?.[0]).toMatchObject({ page: 1 }),
    );
  });

  it('keeps the current page when other items remain', async () => {
    vi.mocked(api.searchItems).mockResolvedValue(paged([item1, item2], { total: 42, page: 2, totalPages: 3 }));
    vi.mocked(api.deleteItem).mockResolvedValue(undefined);

    const { result } = renderHook(() => useLibrary(), { wrapper: createWrapper('/library?page=2') });
    await waitFor(() => expect(result.current.items).toHaveLength(2));

    await act(async () => {
      await result.current.removeItem('1');
    });

    await waitFor(() => expect(api.searchItems).toHaveBeenCalledTimes(2));
    expect(vi.mocked(api.searchItems).mock.calls[1][0]).toMatchObject({ page: 2 });
  });
});
