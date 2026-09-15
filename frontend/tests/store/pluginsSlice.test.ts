import { describe, it, expect } from 'vitest';
import pluginsReducer, {
  setManifests,
  setLoading,
  setError,
} from '../../src/store/pluginsSlice';
import type { PluginManifest } from '../../src/types';

const manifest: PluginManifest = {
  name: 'rating',
  version: '1.0.0',
  description: '评分',
  author: 'KnowFlow',
  frontend_entry: 'frontend.tsx',
};

const initial = pluginsReducer(undefined, { type: 'init' });

describe('pluginsSlice', () => {
  it('has the expected initial state', () => {
    expect(initial).toEqual({ manifests: [], loading: false, error: null });
  });

  it('stores manifests and clears loading/error', () => {
    const prev = { ...initial, loading: true, error: 'x' };
    const next = pluginsReducer(prev, setManifests([manifest]));

    expect(next.manifests).toHaveLength(1);
    expect(next.manifests[0].name).toBe('rating');
    expect(next.loading).toBe(false);
    expect(next.error).toBeNull();
  });

  it('tracks loading and error flags', () => {
    let next = pluginsReducer(initial, setLoading(true));
    expect(next.loading).toBe(true);
    next = pluginsReducer(next, setError('fail'));
    expect(next.error).toBe('fail');
    expect(next.loading).toBe(false);
  });
});
