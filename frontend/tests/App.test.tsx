import { describe, it, expect, vi, beforeEach } from 'vitest';
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

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render App component', async () => {
    renderWithProviders(<App />, { route: '/' });

    expect(await screen.findByText(/KnowFlow/i)).toBeInTheDocument();
  });

  it('should render sidebar navigation', async () => {
    renderWithProviders(<App />, { route: '/' });

    expect(await screen.findByRole('link', { name: /知识库/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /分类管理/ })).toBeInTheDocument();
  });
});
