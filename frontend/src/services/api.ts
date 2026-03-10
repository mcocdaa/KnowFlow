import type { KnowledgeItem, KeyDefinition, CategoryDefinition } from '../types';

const API_BASE_URL = '/api/v1';

interface ItemWrapper {
  item?: {
    id?: string;
    name?: string;
    created_at?: string;
  };
  id?: string;
  name?: string;
  attributes?: Record<string, unknown> & {
    name?: string;
    created_at?: string;
  };
  keyValues?: Record<string, unknown>;
}

export const transformItemData = (itemWrapper: ItemWrapper): KnowledgeItem => ({
  id: itemWrapper.item?.id || itemWrapper.id || '',
  name: itemWrapper.item?.name || itemWrapper.name || itemWrapper.attributes?.name || '',
  keyValues: (itemWrapper.attributes || itemWrapper.keyValues || {}) as Record<string, unknown>,
  createdAt: itemWrapper.item?.created_at || itemWrapper.attributes?.created_at || '',
});

export const api = {
  async fetchItems(): Promise<KnowledgeItem[]> {
    const response = await fetch(`${API_BASE_URL}/item`);
    if (!response.ok) throw new Error('Failed to fetch items');
    const data = await response.json();
    return data.map(transformItemData);
  },

  async fetchCategories(): Promise<CategoryDefinition[]> {
    const response = await fetch(`${API_BASE_URL}/categories`);
    if (!response.ok) throw new Error('Failed to fetch categories');
    return response.json();
  },

  async fetchKeys(): Promise<KeyDefinition[]> {
    const response = await fetch(`${API_BASE_URL}/keys`);
    if (!response.ok) throw new Error('Failed to fetch keys');
    return response.json();
  },

  async updateItem(item: KnowledgeItem): Promise<KnowledgeItem> {
    const response = await fetch(`${API_BASE_URL}/item/${item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (!response.ok) throw new Error('Failed to update item');
    const data = await response.json();
    return transformItemData(data);
  },

  async deleteItem(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/item/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete item');
  },

  async uploadFile(file: File, keyValues: Record<string, unknown>): Promise<KnowledgeItem> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('data', JSON.stringify({ keyValues }));

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: '上传失败' }));
      throw new Error(errorData.detail || '上传失败');
    }
    const data = await response.json();
    return transformItemData(data);
  },

  async createItem(name: string, keyValues: Record<string, unknown>): Promise<KnowledgeItem> {
    const response = await fetch(`${API_BASE_URL}/item`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, keyValues }),
    });
    if (!response.ok) throw new Error('Failed to create item');
    const data = await response.json();
    return transformItemData(data);
  },
};

export default api;
