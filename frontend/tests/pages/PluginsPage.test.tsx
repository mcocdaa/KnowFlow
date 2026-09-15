import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import PluginsPage from '../../src/pages/PluginsPage';
import { api } from '../../src/services/api';
import { renderWithProviders } from '../utils/renderWithProviders';
import { initializePlugins } from '../../src/plugins';

vi.mock('../../src/services/api', async () => {
  const { createApiMock } = await import('../utils/mockApi');
  const mockApi = createApiMock();
  return { API_BASE_URL: '/api/v1', api: mockApi, default: mockApi };
});

describe('PluginsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    initializePlugins();
    vi.mocked(api.fetchPluginManifests).mockResolvedValue([
      {
        name: 'rating',
        version: '1.0.0',
        description: '为知识项添加星级评分功能',
        author: 'KnowFlow',
        frontend_entry: 'frontend.tsx',
      },
      {
        name: 'knowflow_openclaw',
        version: '1.0.0',
        description: 'KnowFlow OpenClaw 桥接插件',
        author: 'KnowFlow',
        frontend_entry: 'frontend.tsx',
      },
    ]);
  });

  it('lists manifests from the backend and marks registered UI components', async () => {
    renderWithProviders(<PluginsPage />);

    expect(await screen.findByText('rating')).toBeInTheDocument();
    expect(screen.getByText('knowflow_openclaw')).toBeInTheDocument();
    expect(screen.getAllByText('1.0.0')).toHaveLength(2);
    expect(screen.getByText('为知识项添加星级评分功能')).toBeInTheDocument();
    expect(screen.getByText('已注册 UI 组件')).toBeInTheDocument();
    expect(screen.getByText('仅后端')).toBeInTheDocument();
    expect(api.fetchPluginManifests).toHaveBeenCalledTimes(1);
  });

  it('shows an error state with retry', async () => {
    vi.mocked(api.fetchPluginManifests)
      .mockRejectedValueOnce(new Error('插件服务不可用'))
      .mockResolvedValueOnce([]);

    renderWithProviders(<PluginsPage />);

    expect(await screen.findByText(/加载失败/)).toBeInTheDocument();
    expect(screen.getByText('插件服务不可用')).toBeInTheDocument();
  });
});
