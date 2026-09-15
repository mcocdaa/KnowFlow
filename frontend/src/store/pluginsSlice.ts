import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { PluginManifest } from '../types';

interface PluginsState {
  manifests: PluginManifest[];
  loading: boolean;
  error: string | null;
}

const initialState: PluginsState = {
  manifests: [],
  loading: false,
  error: null,
};

const pluginsSlice = createSlice({
  name: 'plugins',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    setManifests: (state, action: PayloadAction<PluginManifest[]>) => {
      state.manifests = action.payload;
      state.loading = false;
      state.error = null;
    },
  },
});

export const { setLoading, setError, setManifests } = pluginsSlice.actions;
export default pluginsSlice.reducer;
