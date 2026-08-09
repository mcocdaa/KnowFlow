import type { KnowledgeItem, KeyDefinition, CategoryDefinition } from '../types';

export const API_BASE_URL = window.knowflow?.apiBase ?? import.meta.env.VITE_API_BASE_URL ?? '/api/v1';

interface Envelope<T> {
  code: number;
  message: string;
  data: T;
}

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

const transformItemData = (itemWrapper: ItemWrapper): KnowledgeItem => ({
  id: itemWrapper.item?.id || itemWrapper.id || '',
  name: itemWrapper.item?.name || itemWrapper.name || itemWrapper.attributes?.name || '',
  keyValues: (itemWrapper.attributes || itemWrapper.keyValues || {}) as Record<string, unknown>,
  createdAt: itemWrapper.item?.created_at || itemWrapper.attributes?.created_at || '',
});

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, options);

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as Envelope<unknown> | null;
    throw new Error(body?.message || `请求失败 (${response.status})`);
  }

  const body = (await response.json()) as Envelope<T>;
  return body.data;
}

export const api = {
  async fetchItems(): Promise<KnowledgeItem[]> {
    const data = await request<ItemWrapper[]>('/item');
    return data.map(transformItemData);
  },

  async fetchCategories(): Promise<CategoryDefinition[]> {
    return request('/categories');
  },

  async fetchKeys(): Promise<KeyDefinition[]> {
    return request('/keys');
  },

  async updateItem(item: KnowledgeItem): Promise<KnowledgeItem> {
    const data = await request<ItemWrapper>(`/item/${item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    return transformItemData(data);
  },

  async deleteItem(id: string): Promise<void> {
    await request(`/item/${id}`, { method: 'DELETE' });
  },

  async uploadFile(file: File, keyValues: Record<string, unknown>): Promise<KnowledgeItem> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('data', JSON.stringify({ keyValues }));

    const data = await request<ItemWrapper>('/upload', { method: 'POST', body: formData });
    return transformItemData(data);
  },

  async createItem(name: string, keyValues: Record<string, unknown>): Promise<KnowledgeItem> {
    const data = await request<ItemWrapper>('/item', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, keyValues }),
    });
    return transformItemData(data);
  },

  async aiSearch(query: string, items: KnowledgeItem[]): Promise<KnowledgeItem[]> {
    return request('/ai/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, items }),
    });
  },

  async autoTag(items: KnowledgeItem[]): Promise<Record<string, string[]>> {
    const data = await request<{ results: Record<string, string[]> }>('/ai/auto-tag', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });
    return data.results;
  },

  async updatePluginRating(itemId: string, rating: number): Promise<void> {
    await request(`/plugins/rating/items/${itemId}/rating`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating }),
    });
  },
};

export default api;
