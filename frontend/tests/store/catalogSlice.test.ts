import { describe, it, expect } from 'vitest';
import catalogReducer, {
  setKeys,
  setCategories,
  setLoading,
  setError,
  upsertKey,
  removeKey,
  upsertCategory,
  removeCategory,
} from '../../src/store/catalogSlice';
import type { CategoryDefinition, KeyDefinition } from '../../src/types';

const key = (name: string, title = name): KeyDefinition =>
  ({ name, title, value_type: 'string' }) as KeyDefinition;
const category = (name: string, title = name): CategoryDefinition =>
  ({ name, title, parent_name: null, is_builtin: false }) as CategoryDefinition;

const initial = catalogReducer(undefined, { type: 'init' });

describe('catalogSlice', () => {
  it('has the expected initial state', () => {
    expect(initial).toEqual({ keys: [], categories: [], loading: false, error: null });
  });

  it('stores keys and categories', () => {
    let next = catalogReducer(initial, setKeys([key('a')]));
    expect(next.keys.map((k) => k.name)).toEqual(['a']);

    next = catalogReducer(next, setCategories([category('c')]));
    expect(next.categories.map((c) => c.name)).toEqual(['c']);
  });

  it('tracks loading and error flags', () => {
    let next = catalogReducer(initial, setLoading(true));
    expect(next.loading).toBe(true);

    next = catalogReducer(next, setError('oops'));
    expect(next.error).toBe('oops');
    expect(next.loading).toBe(false);
  });

  it('upserts keys by name', () => {
    const added = catalogReducer(initial, upsertKey(key('a', '旧')));
    expect(added.keys).toHaveLength(1);

    const updated = catalogReducer(added, upsertKey(key('a', '新')));
    expect(updated.keys).toHaveLength(1);
    expect(updated.keys[0].title).toBe('新');
  });

  it('removes keys by name', () => {
    const prev = { ...initial, keys: [key('a'), key('b')] };
    expect(catalogReducer(prev, removeKey('a')).keys.map((k) => k.name)).toEqual(['b']);
  });

  it('upserts and removes categories by name', () => {
    const added = catalogReducer(initial, upsertCategory(category('c', '旧')));
    const updated = catalogReducer(added, upsertCategory(category('c', '新')));
    expect(updated.categories).toHaveLength(1);
    expect(updated.categories[0].title).toBe('新');

    expect(catalogReducer(updated, removeCategory('c')).categories).toHaveLength(0);
  });
});
