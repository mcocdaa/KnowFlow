import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { KnowledgeItem } from '../types';

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
    addKnowledgeItem: (state, action: PayloadAction<KnowledgeItem>) => {
      state.items.push(action.payload);
    },
    updateKnowledgeItem: (state, action: PayloadAction<KnowledgeItem>) => {
      const index = state.items.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
      const resultIndex = state.searchResults.findIndex(item => item.id === action.payload.id);
      if (resultIndex !== -1) {
        state.searchResults[resultIndex] = action.payload;
      }
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
    setSearchResults: (state, action: PayloadAction<KnowledgeItem[]>) => {
      state.searchResults = action.payload;
    },
    selectItem: (state, action: PayloadAction<string>) => {
      state.selectedItem = state.items.find(item => item.id === action.payload) || null;
    },
    setItems: (state, action: PayloadAction<KnowledgeItem[]>) => {
      state.items = action.payload;
    },
  },
});

export const { 
  clearKnowledgeItems, 
  addKnowledgeItem, 
  updateKnowledgeItem, 
  deleteKnowledgeItem, 
  setSearchResults, 
  selectItem, 
  setItems 
} = knowledgeSlice.actions;
export default knowledgeSlice.reducer;
