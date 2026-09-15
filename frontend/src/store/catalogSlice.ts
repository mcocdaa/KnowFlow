import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { CategoryDefinition, KeyDefinition } from '../types';

interface CatalogState {
  keys: KeyDefinition[];
  categories: CategoryDefinition[];
  loading: boolean;
  error: string | null;
}

const initialState: CatalogState = {
  keys: [],
  categories: [],
  loading: false,
  error: null,
};

const catalogSlice = createSlice({
  name: 'catalog',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    setKeys: (state, action: PayloadAction<KeyDefinition[]>) => {
      state.keys = action.payload;
      state.loading = false;
      state.error = null;
    },
    setCategories: (state, action: PayloadAction<CategoryDefinition[]>) => {
      state.categories = action.payload;
      state.loading = false;
      state.error = null;
    },
    upsertKey: (state, action: PayloadAction<KeyDefinition>) => {
      const index = state.keys.findIndex((key) => key.name === action.payload.name);
      if (index === -1) {
        state.keys.push(action.payload);
      } else {
        state.keys[index] = action.payload;
      }
    },
    removeKey: (state, action: PayloadAction<string>) => {
      state.keys = state.keys.filter((key) => key.name !== action.payload);
    },
    upsertCategory: (state, action: PayloadAction<CategoryDefinition>) => {
      const index = state.categories.findIndex((category) => category.name === action.payload.name);
      if (index === -1) {
        state.categories.push(action.payload);
      } else {
        state.categories[index] = action.payload;
      }
    },
    removeCategory: (state, action: PayloadAction<string>) => {
      state.categories = state.categories.filter((category) => category.name !== action.payload);
    },
  },
});

export const {
  setLoading,
  setError,
  setKeys,
  setCategories,
  upsertKey,
  removeKey,
  upsertCategory,
  removeCategory,
} = catalogSlice.actions;

export default catalogSlice.reducer;
