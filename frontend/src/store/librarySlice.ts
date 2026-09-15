import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { ItemSort, KnowledgeItem, PagedItems } from '../types';

export interface LibraryQuery {
  q: string;
  key: string;
  keyValue: string;
  sort: ItemSort;
}

interface LibraryState {
  items: KnowledgeItem[];
  total: number;
  page: number;
  pageSize: number;
  query: LibraryQuery;
  loading: boolean;
  error: string | null;
  selectedId: string | null;
}

const initialState: LibraryState = {
  items: [],
  total: 0,
  page: 1,
  pageSize: 20,
  query: { q: '', key: '', keyValue: '', sort: 'recent' },
  loading: false,
  error: null,
  selectedId: null,
};

const librarySlice = createSlice({
  name: 'library',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    setResult: (state, action: PayloadAction<PagedItems>) => {
      state.items = action.payload.items;
      state.total = action.payload.total;
      state.page = action.payload.page;
      state.pageSize = action.payload.pageSize;
      state.loading = false;
      state.error = null;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setQuery: (state, action: PayloadAction<Partial<LibraryQuery> & { page?: number }>) => {
      const { page, ...query } = action.payload;
      Object.assign(state.query, query);
      state.page = page ?? 1;
    },
    upsertItem: (state, action: PayloadAction<KnowledgeItem>) => {
      const index = state.items.findIndex((item) => item.id === action.payload.id);
      if (index === -1) {
        state.items.unshift(action.payload);
        state.total += 1;
      } else {
        state.items[index] = action.payload;
      }
    },
    removeItem: (state, action: PayloadAction<string>) => {
      const existed = state.items.some((item) => item.id === action.payload);
      state.items = state.items.filter((item) => item.id !== action.payload);
      if (existed) {
        state.total = Math.max(0, state.total - 1);
      }
      if (state.selectedId === action.payload) {
        state.selectedId = null;
      }
    },
    selectItem: (state, action: PayloadAction<string | null>) => {
      state.selectedId = action.payload;
    },
  },
});

export const {
  setLoading,
  setError,
  setResult,
  setPage,
  setQuery,
  upsertItem,
  removeItem,
  selectItem,
} = librarySlice.actions;

export default librarySlice.reducer;
