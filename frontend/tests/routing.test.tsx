import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import App from '../src/App';
import { renderWithProviders } from './utils/renderWithProviders';

vi.mock('../src/services/api', () => {
  const mockApi = {
    searchItems: vi.fn().mockResolvedValue({ items: [], total: 0, page: 1, pageSize: 20, totalPages: 0 }),
    fetchItems: vi.fn().mockResolvedValue([]),
    fetchCategories: vi.fn().mockResolvedValue([]),
    fetchKeys: vi.fn().mockResolvedValue([]),
  };
  return { api: mockApi, default: mockApi };
});

describe('routing', () => {
  it('redirects / to the library page', async () => {
    renderWithProviders(<App />, { route: '/' });
    expect(await screen.findByRole('heading', { name: '知识库' })).toBeInTheDocument();
  });

  it.each([
    ['/categories', '分类管理'],
    ['/keys', 'Key 管理'],
    ['/plugins', '插件'],
    ['/ai', 'AI 助手'],
  ])('renders %s', async (route, title) => {
    renderWithProviders(<App />, { route });
    expect(await screen.findByRole('heading', { name: title })).toBeInTheDocument();
  });

  it('renders 404 for unknown routes', async () => {
    renderWithProviders(<App />, { route: '/does-not-exist' });
    expect(await screen.findByText(/页面不存在/)).toBeInTheDocument();
  });

  it('marks the active nav item with aria-current', async () => {
    renderWithProviders(<App />, { route: '/keys' });
    expect(await screen.findByRole('link', { name: /Key 管理/ })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: /知识库/ })).not.toHaveAttribute('aria-current');
  });

  it('renders all five sidebar destinations', async () => {
    renderWithProviders(<App />, { route: '/library' });
    for (const name of [/知识库/, /分类管理/, /Key 管理/, /插件/, /AI 助手/]) {
      expect(await screen.findByRole('link', { name })).toBeInTheDocument();
    }
  });
});
