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

  it('translates seeded item titles, OpenClaw category, and backend errors in both zh and en modes', async () => {
    const { translateText } = await import('../src/i18n');
    const { getErrorMessage } = await import('../src/utils/helpers');

    expect(translateText('en', 'OpenClaw集成')).toBe('OpenClaw Integration');
    expect(translateText('en', 'KnowFlow 统一架构设计说明书.md')).toBe(
      'KnowFlow Unified Architecture Design Spec.md',
    );
    expect(translateText('en', '架构设计')).toBe('Architecture Design');

    // Reverse dictionary (en -> zh) when switching back to zh
    expect(translateText('zh', 'OpenClaw Integration')).toBe('OpenClaw集成');
    expect(translateText('zh', 'KnowFlow Unified Architecture Design Spec.md')).toBe(
      'KnowFlow 统一架构设计说明书.md',
    );
    expect(translateText('zh', 'Failed to load library data')).toBe('知识列表加载失败');
    expect(translateText('zh', 'AI feature is disabled. Please configure DOUBAO_API_KEY.')).toBe(
      'AI 功能未启用，请配置 DOUBAO_API_KEY',
    );

    window.localStorage.setItem(LANG_STORAGE_KEY, 'zh');
    expect(getErrorMessage(new Error('cannot delete category with existing children'), '失败')).toBe(
      '无法删除包含子分类的分类',
    );
    expect(getErrorMessage(new Error('Missing required keys: file_path'), '失败')).toBe(
      '缺少必填字段：file_path',
    );

    window.localStorage.setItem(LANG_STORAGE_KEY, 'en');
    expect(getErrorMessage(new Error('AI 功能未启用，请配置 DOUBAO_API_KEY'), 'Failed')).toBe(
      'AI feature is disabled. Please configure DOUBAO_API_KEY.',
    );
    expect(getErrorMessage(new Error('文件大小超过上限 10MB'), 'Failed')).toBe(
      'File size exceeds the 10MB limit',
    );
  });

  it('dispatches knowflow:lang-change custom event when language is toggled', async () => {
    const user = userEvent.setup();
    const receivedLangs: string[] = [];
    const onLangChange = (ev: Event) => {
      const detail = (ev as CustomEvent<{ lang?: string }>).detail;
      if (detail?.lang) {
        receivedLangs.push(detail.lang);
      }
    };
    window.addEventListener('knowflow:lang-change', onLangChange);

    try {
      renderWithProviders(<App />, { route: '/plugins' });
      const toggleBtn = await screen.findByTestId('lang-toggle-btn');

      await user.click(toggleBtn);
      expect(receivedLangs).toEqual(['en']);

      await user.click(toggleBtn);
      expect(receivedLangs).toEqual(['en', 'zh']);
    } finally {
      window.removeEventListener('knowflow:lang-change', onLangChange);
    }
  });
});
