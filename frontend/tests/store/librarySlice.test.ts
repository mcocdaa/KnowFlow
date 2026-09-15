import { describe, it, expect } from 'vitest';
import libraryReducer, {
  setResult,
  setQuery,
  setPage,
  setLoading,
  setError,
  removeItem,
  upsertItem,
  selectItem,
} from '../../src/store/librarySlice';
import type { KnowledgeItem } from '../../src/types';

const item = (id: string, name = id): KnowledgeItem => ({ id, name, keyValues: {} });
const initial = libraryReducer(undefined, { type: 'init' });

describe('librarySlice', () => {
  it('has the expected initial state', () => {
    expect(initial).toMatchObject({
      items: [],
      total: 0,
      page: 1,
      pageSize: 20,
      query: { q: '', key: '', keyValue: '', sort: 'recent' },
      loading: false,
      error: null,
      selectedId: null,
    });
  });

  it('stores a page of results and clears loading/error', () => {
    const prev = { ...initial, loading: true, error: 'boom' };
    const next = libraryReducer(prev, setResult({ items: [item('1')], total: 42, page: 2, pageSize: 20 }));

    expect(next.items).toHaveLength(1);
    expect(next.total).toBe(42);
    expect(next.page).toBe(2);
    expect(next.loading).toBe(false);
    expect(next.error).toBeNull();
  });

  it('merges query changes and resets to page 1', () => {
    const next = libraryReducer({ ...initial, page: 3 }, setQuery({ q: 'abc' }));

    expect(next.query.q).toBe('abc');
    expect(next.query.sort).toBe('recent');
    expect(next.page).toBe(1);
  });

  it('keeps an explicit page in setQuery', () => {
    const next = libraryReducer(initial, setQuery({ page: 4 }));

    expect(next.page).toBe(4);
  });

  it('updates page, loading and error flags', () => {
    let next = libraryReducer(initial, setPage(3));
    expect(next.page).toBe(3);
    next = libraryReducer(next, setLoading(true));
    expect(next.loading).toBe(true);
    next = libraryReducer(next, setError('nope'));
    expect(next.error).toBe('nope');
    expect(next.loading).toBe(false);
  });

  it('removes an item and decrements total, clearing selection', () => {
    const prev = { ...initial, items: [item('1'), item('2')], total: 2, selectedId: '1' };
    const next = libraryReducer(prev, removeItem('1'));

    expect(next.items.map((i) => i.id)).toEqual(['2']);
    expect(next.total).toBe(1);
    expect(next.selectedId).toBeNull();
  });

  it('upserts items: prepend new ones, replace existing ones', () => {
    const prev = { ...initial, items: [item('1', 'old')], total: 1 };

    const added = libraryReducer(prev, upsertItem(item('2')));
    expect(added.items.map((i) => i.id)).toEqual(['2', '1']);
    expect(added.total).toBe(2);

    const updated = libraryReducer(added, upsertItem(item('1', 'new')));
    expect(updated.items.find((i) => i.id === '1')?.name).toBe('new');
    expect(updated.items).toHaveLength(2);
    expect(updated.total).toBe(2);
  });

  it('selects and clears an item', () => {
    expect(libraryReducer(initial, selectItem('1')).selectedId).toBe('1');
    expect(libraryReducer({ ...initial, selectedId: '1' }, selectItem(null)).selectedId).toBeNull();
  });
});
