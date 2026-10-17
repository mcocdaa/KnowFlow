import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App';
import { LANG_STORAGE_KEY } from '../src/i18n';
import { renderWithProviders } from './utils/renderWithProviders';

vi.mock('../src/services/api', async () => {
  const { createApiMock } = await import('./utils/mockApi');
  const mockApi = createApiMock();
  return { API_BASE_URL: '/api/v1', api: mockApi, default: mockApi };
});

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.removeItem(LANG_STORAGE_KEY);
  });

  afterEach(() => {
    window.localStorage.removeItem(LANG_STORAGE_KEY);
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

  it('switches UI between Chinese (zh) and English (en) when clicking lang-toggle-btn', async () => {
    const user = userEvent.setup();
    renderWithProviders(<App />, { route: '/library' });

    const toggleBtn = await screen.findByTestId('lang-toggle-btn');
    expect(toggleBtn).toHaveTextContent('EN');
    expect(screen.getByRole('heading', { name: '知识库' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '分类管理' })).toBeInTheDocument();

    // Switch to English
    await user.click(toggleBtn);
    expect(toggleBtn).toHaveTextContent('中文');
    expect(window.localStorage.getItem(LANG_STORAGE_KEY)).toBe('en');
    expect(screen.getByRole('heading', { name: 'Library' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Categories' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Schema Keys' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Plugins' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'AI Assistant' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search title or attributes...')).toBeInTheDocument();

    // Switch back to Chinese
    await user.click(toggleBtn);
    expect(toggleBtn).toHaveTextContent('EN');
    expect(window.localStorage.getItem(LANG_STORAGE_KEY)).toBe('zh');
    expect(screen.getByRole('heading', { name: '知识库' })).toBeInTheDocument();
  });
});
