import type {
  CategoryDefinition,
  CategoryInput,
  KeyDefinition,
  KnowledgeItem,
  PagedItems,
  PluginManifest,
  SearchParams,
} from '../types';

const rawApiBase = window.knowflow?.apiBase ?? import.meta.env.VITE_API_BASE_URL;
export const API_BASE_URL = rawApiBase && rawApiBase.trim() ? rawApiBase.trim() : '/api/v1';

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
    updated_at?: string;
  };
  id?: string;
  name?: string;
  attributes?: Record<string, unknown> & {
    name?: string;
    created_at?: string;
    updated_at?: string;
  };
  key_info?: Record<string, KeyDefinition>;
}

interface PagedItemsWire {
  items: ItemWrapper[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

const transformItemData = (itemWrapper: ItemWrapper): KnowledgeItem => ({
  id: itemWrapper.item?.id || itemWrapper.id || '',
  name: itemWrapper.item?.name || itemWrapper.name || itemWrapper.attributes?.name || '',
  keyValues: (itemWrapper.attributes || {}) as Record<string, unknown>,
  keyInfo: itemWrapper.key_info,
  createdAt: itemWrapper.item?.created_at || itemWrapper.attributes?.created_at || '',
  updatedAt: itemWrapper.item?.updated_at || itemWrapper.attributes?.updated_at || '',
});

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, options);
  const body = (await response.json().catch(() => null)) as Envelope<T> | null;

  if (!response.ok) {
    throw new Error(body?.message || `请求失败 (${response.status})`);
  }
  if (body && body.code !== 0) {
    throw new Error(body.message || '请求失败');
  }

  return (body as Envelope<T>).data;
}

const jsonInit = (method: string, payload?: unknown): RequestInit => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  ...(payload === undefined ? {} : { body: JSON.stringify(payload) }),
});

export const api = {
  async searchItems(params: SearchParams = {}): Promise<PagedItems> {
    const query = new URLSearchParams();
    if (params.q) query.set('q', params.q);
    if (params.key) query.set('key', params.key);
    if (params.keyValue) query.set('key_value', params.keyValue);
    if (params.sort) query.set('sort', params.sort);
    if (params.page) query.set('page', String(params.page));
    if (params.pageSize) query.set('page_size', String(params.pageSize));

    const qs = query.toString();
    const data = await request<PagedItemsWire>(`/item/search${qs ? `?${qs}` : ''}`);

    return {
      items: data.items.map(transformItemData),
      total: data.total,
      page: data.page,
      pageSize: data.page_size,
      totalPages: data.total_pages,
    };
  },

  async fetchItems(): Promise<KnowledgeItem[]> {
    const data = await request<ItemWrapper[]>('/item');
    return data.map(transformItemData);
  },

  async fetchCategories(): Promise<CategoryDefinition[]> {
    return request('/categories');
  },

  async createCategory(input: CategoryInput): Promise<CategoryDefinition> {
    return request('/categories', jsonInit('POST', input));
  },

  async updateCategory(name: string, updates: Partial<CategoryInput>): Promise<CategoryDefinition> {
    return request(`/categories/${encodeURIComponent(name)}`, jsonInit('PUT', updates));
  },

  async deleteCategory(name: string): Promise<void> {
    await request(`/categories/${encodeURIComponent(name)}`, { method: 'DELETE' });
  },

  async fetchKeys(): Promise<KeyDefinition[]> {
    return request('/keys');
  },

  async createKey(key: Partial<KeyDefinition>): Promise<KeyDefinition> {
    return request('/keys', jsonInit('POST', key));
  },

  async updateKey(keyName: string, updates: Partial<KeyDefinition>): Promise<KeyDefinition> {
    return request(`/keys/${encodeURIComponent(keyName)}`, jsonInit('PUT', updates));
  },

  async deleteKey(keyName: string): Promise<void> {
    await request(`/keys/${encodeURIComponent(keyName)}`, { method: 'DELETE' });
  },

  async fetchPluginManifests(): Promise<PluginManifest[]> {
    return request('/plugins/manifests');
  },

  async updateItem(item: KnowledgeItem): Promise<KnowledgeItem> {
    // 线格式规范字段名为 attributes；内部命名 keyValues 在此边界做映射
    const data = await request<ItemWrapper>(`/item/${item.id}`, jsonInit('PUT', {
      name: item.name,
      attributes: item.keyValues,
    }));
    return transformItemData(data);
  },

  async deleteItem(id: string): Promise<void> {
    await request(`/item/${id}`, { method: 'DELETE' });
  },

  uploadFile(
    file: File,
    keyValues: Record<string, unknown>,
    onProgress?: (percent: number) => void,
  ): Promise<KnowledgeItem> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API_BASE_URL}/upload`);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          onProgress(Math.round((event.loaded / event.total) * 100));
        }
      };

      xhr.onerror = () => {
        reject(new Error('网络错误，文件上传失败'));
      };

      xhr.onload = () => {
        let body: Envelope<ItemWrapper> | null = null;
        try {
          body = JSON.parse(xhr.responseText) as Envelope<ItemWrapper>;
        } catch {
          body = null;
        }

        if (xhr.status >= 200 && xhr.status < 300 && body && body.code === 0) {
          resolve(transformItemData(body.data));
        } else {
          reject(new Error(body?.message || `请求失败 (${xhr.status})`));
        }
      };

      const formData = new FormData();
      formData.append('file', file);
      formData.append('data', JSON.stringify({ attributes: keyValues }));
      xhr.send(formData);
    });
  },

  async createItem(name: string, keyValues: Record<string, unknown>): Promise<KnowledgeItem> {
    const data = await request<ItemWrapper>('/item', jsonInit('POST', {
      name,
      attributes: keyValues,
    }));
    return transformItemData(data);
  },

  async aiSearch(query: string, items: KnowledgeItem[]): Promise<KnowledgeItem[]> {
    // ItemBrief 协议字段名为 attributes；内部命名 keyValues 在此边界做映射
    const briefs = items.map((i) => ({ id: i.id, name: i.name, attributes: i.keyValues }));
    const data = await request<ItemWrapper[]>('/ai/search', jsonInit('POST', { query, items: briefs }));
    return data.map(transformItemData);
  },

  async autoTag(items: KnowledgeItem[]): Promise<Record<string, string[]>> {
    const briefs = items.map((i) => ({ id: i.id, name: i.name, attributes: i.keyValues }));
    const data = await request<{ results: Record<string, string[]> }>('/ai/auto-tag', jsonInit('POST', {
      items: briefs,
    }));
    return data.results;
  },

  async updatePluginRating(itemId: string, rating: number): Promise<void> {
    await request(`/plugins/rating/items/${itemId}/rating`, jsonInit('PUT', { rating }));
  },
};

export default api;
