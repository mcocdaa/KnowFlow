import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface KeyValue {
  keyId: string;
  value: string;
}

interface KnowledgeItem {
  id: string;
  filePath: string;
  fileType: string;
  createdAt: string;
  clickCount: number;
  starRating: number;
  keyValues: KeyValue[];
}

interface KnowledgeState {
  items: KnowledgeItem[];
  searchResults: KnowledgeItem[];
  selectedItem: KnowledgeItem | null;
}

const initialState: KnowledgeState = {
  items: [],
  searchResults: [],
  selectedItem: null,
};

const knowledgeSlice = createSlice({
  name: 'knowledge',
  initialState,
  reducers: {
    clearKnowledgeItems: (state) => {
      state.items = [];
      state.searchResults = [];
    },
    addKnowledgeItem: (state, action: PayloadAction<Omit<KnowledgeItem, 'id'> & { id?: string }>) => {
      const newId = action.payload.id || (state.items.length + 1).toString();
      const newItem = { ...action.payload, id: newId };
      state.items.push(newItem);
    },
    updateKnowledgeItem: (state, action: PayloadAction<KnowledgeItem>) => {
      const index = state.items.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
      // 更新搜索结果中的对应项
      const resultIndex = state.searchResults.findIndex(item => item.id === action.payload.id);
      if (resultIndex !== -1) {
        state.searchResults[resultIndex] = action.payload;
      }
      // 更新选中项
      if (state.selectedItem?.id === action.payload.id) {
        state.selectedItem = action.payload;
      }
    },
    deleteKnowledgeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      state.searchResults = state.searchResults.filter(item => item.id !== action.payload);
      if (state.selectedItem?.id === action.payload) {
        state.selectedItem = null;
      }
    },
    incrementClickCount: (state, action: PayloadAction<string>) => {
      const item = state.items.find(item => item.id === action.payload);
      if (item) {
        item.clickCount += 1;
      }
      const resultItem = state.searchResults.find(item => item.id === action.payload);
      if (resultItem) {
        resultItem.clickCount += 1;
      }
      if (state.selectedItem?.id === action.payload) {
        state.selectedItem.clickCount += 1;
      }
    },
    setStarRating: (state, action: PayloadAction<{ id: string; rating: number }>) => {
      const item = state.items.find(item => item.id === action.payload.id);
      if (item) {
        item.starRating = action.payload.rating;
      }
      const resultItem = state.searchResults.find(item => item.id === action.payload.id);
      if (resultItem) {
        resultItem.starRating = action.payload.rating;
      }
      if (state.selectedItem?.id === action.payload.id) {
        state.selectedItem.starRating = action.payload.rating;
      }
    },
    setSearchResults: (state, action: PayloadAction<KnowledgeItem[]>) => {
      state.searchResults = action.payload;
    },
    selectItem: (state, action: PayloadAction<string>) => {
      state.selectedItem = state.items.find(item => item.id === action.payload) || null;
    },
  },
});

export const { addKnowledgeItem, updateKnowledgeItem, deleteKnowledgeItem, incrementClickCount, setStarRating, setSearchResults, selectItem, clearKnowledgeItems } = knowledgeSlice.actions;
export default knowledgeSlice.reducer;
