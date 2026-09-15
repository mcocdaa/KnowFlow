import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { api } from '../../src/services/api';
import { MockXMLHttpRequest } from '../utils/mockXhr';

const jsonResponse = (data: unknown, status = 200, code = 0, message = 'ok') =>
  Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve({ code, message, data }),
  } as unknown as Response);

describe('api.searchItems', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('builds query params and maps the paged response', async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockReturnValueOnce(
      jsonResponse({
        items: [
          {
            item: { id: '1', name: 'a', created_at: '2026-01-01', updated_at: '2026-01-02' },
            attributes: { name: 'a', rating: 5 },
            key_info: { name: { title: '名称' } },
          },
        ],
        total: 42,
        page: 2,
        page_size: 20,
        total_pages: 3,
      }),
    );

    const result = await api.searchItems({
      q: '部署',
      key: 'rating',
      keyValue: '5',
      sort: 'rating',
      page: 2,
      pageSize: 20,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/item/search?q=%E9%83%A8%E7%BD%B2&key=rating&key_value=5&sort=rating&page=2&page_size=20',
      undefined,
    );
    expect(result).toMatchObject({ total: 42, page: 2, pageSize: 20, totalPages: 3 });
    expect(result.items[0]).toMatchObject({
      id: '1',
      name: 'a',
      createdAt: '2026-01-01',
      updatedAt: '2026-01-02',
    });
    expect(result.items[0].keyInfo?.name.title).toBe('名称');
  });

  it('omits empty params', async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockReturnValueOnce(jsonResponse({ items: [], total: 0, page: 1, page_size: 20, total_pages: 0 }));

    await api.searchItems({ q: '', page: 1 });

    expect(fetchMock).toHaveBeenCalledWith('/api/v1/item/search?page=1', undefined);
  });
});

describe('api error handling', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('throws the backend message on HTTP errors', async () => {
    vi.mocked(fetch).mockReturnValueOnce(jsonResponse(null, 400, 400, 'unknown key: nope'));
    await expect(api.searchItems({ key: 'nope' })).rejects.toThrow('unknown key: nope');
  });

  it('throws when the envelope code is not zero', async () => {
    vi.mocked(fetch).mockReturnValueOnce(jsonResponse(null, 200, 500, 'boom'));
    await expect(api.fetchCategories()).rejects.toThrow('boom');
  });
});

describe('api catalog endpoints', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('creates a category', async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockReturnValueOnce(jsonResponse({ name: 'c1', title: '分类一' }));

    await api.createCategory({ name: 'c1', title: '分类一', parent_name: null });

    expect(fetchMock).toHaveBeenCalledWith('/api/v1/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'c1', title: '分类一', parent_name: null }),
    });
  });

  it('updates and deletes a category by encoded name', async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockReturnValueOnce(jsonResponse({ name: 'a b', title: '新标题' }));

    await api.updateCategory('a b', { title: '新标题' });

    expect(fetchMock).toHaveBeenCalledWith('/api/v1/categories/a%20b', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: '新标题' }),
    });

    fetchMock.mockReturnValueOnce(jsonResponse(null));
    await api.deleteCategory('a b');
    expect(fetchMock).toHaveBeenLastCalledWith('/api/v1/categories/a%20b', { method: 'DELETE' });
  });

  it('fetches plugin manifests', async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockReturnValueOnce(
      jsonResponse([{ name: 'rating', version: '1.0.0', description: '评分', author: 'KnowFlow', frontend_entry: 'frontend.tsx' }]),
    );

    const manifests = await api.fetchPluginManifests();

    expect(fetchMock).toHaveBeenCalledWith('/api/v1/plugins/manifests', undefined);
    expect(manifests[0].name).toBe('rating');
  });
});

describe('api.uploadFile', () => {
  beforeEach(() => {
    MockXMLHttpRequest.reset();
    vi.stubGlobal('XMLHttpRequest', MockXMLHttpRequest);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('posts multipart form data and reports progress', async () => {
    const onProgress = vi.fn();
    const file = new File(['hello'], 'a.txt', { type: 'text/plain' });

    const promise = api.uploadFile(file, { name: 'a' }, onProgress);
    const xhr = MockXMLHttpRequest.instances[0];

    expect(xhr.method).toBe('POST');
    expect(xhr.url).toBe('/api/v1/upload');
    const body = xhr.body as FormData;
    expect(body.get('file')).toBeInstanceOf(File);
    expect(JSON.parse(body.get('data') as string)).toEqual({ attributes: { name: 'a' } });

    xhr.emitProgress(50, 100);
    expect(onProgress).toHaveBeenCalledWith(50);

    xhr.respond(200, {
      code: 0,
      message: 'ok',
      data: { item: { id: 'i1', name: 'a', created_at: '2026-01-01' }, attributes: { name: 'a' } },
    });

    await expect(promise).resolves.toMatchObject({ id: 'i1', name: 'a' });
  });

  it('rejects with the backend message on failure', async () => {
    const promise = api.uploadFile(new File(['hello'], 'a.txt'), {});
    const xhr = MockXMLHttpRequest.instances[0];

    xhr.respond(413, { code: 413, message: 'File too large', data: null });

    await expect(promise).rejects.toThrow('File too large');
  });
});
