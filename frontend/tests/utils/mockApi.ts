import { vi } from 'vitest';

export const createApiMock = () => ({
  API_BASE_URL: '/api/v1',
  searchItems: vi.fn().mockResolvedValue({ items: [], total: 0, page: 1, pageSize: 20, totalPages: 0 }),
  fetchItems: vi.fn().mockResolvedValue([]),
  fetchCategories: vi.fn().mockResolvedValue([]),
  createCategory: vi.fn(),
  updateCategory: vi.fn(),
  deleteCategory: vi.fn(),
  fetchKeys: vi.fn().mockResolvedValue([]),
  createKey: vi.fn(),
  updateKey: vi.fn(),
  deleteKey: vi.fn(),
  fetchPluginManifests: vi.fn().mockResolvedValue([]),
  updateItem: vi.fn(),
  deleteItem: vi.fn(),
  uploadFile: vi.fn(),
  createItem: vi.fn(),
  aiSearch: vi.fn(),
  autoTag: vi.fn(),
  updatePluginRating: vi.fn(),
});
