import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AIPage from '../../src/pages/AIPage';
import { api } from '../../src/services/api';
import { renderWithProviders } from '../utils/renderWithProviders';
import type { KnowledgeItem, PagedItems } from '../../src/types';

vi.mock('../../src/services/api', async () => {
  const { createApiMock } = await import('../utils/mockApi');
  const mockApi = createApiMock();
  return { API_BASE_URL: '/api/v1', api: mockApi, default: mockApi };
});

const item1: KnowledgeItem = { id: 'i1', name: '部署手册', keyValues: { name: '部署手册' } };
const item2: KnowledgeItem = { id: 'i2', name: '架构图', keyValues: { name: '架构图' } };

const corpus: PagedItems = {
  items: [item1, item2],
  total: 73,
  page: 1,
  pageSize: 50,
  totalPages: 2,
};

describe('AIPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.searchItems).mockResolvedValue(corpus);
  });

  it('runs a semantic search over the recent corpus', async () => {
    const user = userEvent.setup();
    vi.mocked(api.aiSearch).mockResolvedValue([item1]);

    renderWithProviders(<AIPage />);

    await user.type(screen.getByPlaceholderText(/自然语言/), '部署相关');
    await user.click(screen.getByRole('button', { name: /检\s*索/ }));

    await waitFor(() =>
      expect(api.searchItems).toHaveBeenCalledWith({ sort: 'recent', page: 1, pageSize: 50 }),
    );
    await waitFor(() => expect(api.aiSearch).toHaveBeenCalledWith('部署相关', [item1, item2]));
    expect(await screen.findByText('部署手册')).toBeInTheDocument();
    expect(screen.getByText('仅对最近 50 条生效（共 73 条）')).toBeInTheDocument();
  });

  it('auto-tags the corpus and renders the returned tags', async () => {
    const user = userEvent.setup();
    vi.mocked(api.autoTag).mockResolvedValue({ i1: ['部署', '运维'] });

    renderWithProviders(<AIPage />);

    await user.click(screen.getByRole('tab', { name: '自动打标签' }));
    await user.click(screen.getByRole('button', { name: /开始打标签/ }));

    await waitFor(() => expect(api.autoTag).toHaveBeenCalledWith([item1, item2]));
    expect(await screen.findByText('部署')).toBeInTheDocument();
    expect(screen.getByText('运维')).toBeInTheDocument();
    expect(screen.getByText('部署手册')).toBeInTheDocument();
  });

  it('surfaces backend AI errors', async () => {
    const user = userEvent.setup();
    vi.mocked(api.aiSearch).mockRejectedValue(new Error('DOUBAO_API_KEY is not configured'));

    renderWithProviders(<AIPage />);

    await user.type(screen.getByPlaceholderText(/自然语言/), '任意问题');
    await user.click(screen.getByRole('button', { name: /检\s*索/ }));

    expect(await screen.findByText('DOUBAO_API_KEY is not configured')).toBeInTheDocument();
  });

  it('links results back to the library', async () => {
    const user = userEvent.setup();
    vi.mocked(api.aiSearch).mockResolvedValue([item1]);

    renderWithProviders(<AIPage />);

    await user.type(screen.getByPlaceholderText(/自然语言/), '部署');
    await user.click(screen.getByRole('button', { name: /检\s*索/ }));

    const link = await screen.findByRole('link', { name: '部署手册' });
    expect(link).toHaveAttribute('href', expect.stringContaining('/library?q='));
  });
});
