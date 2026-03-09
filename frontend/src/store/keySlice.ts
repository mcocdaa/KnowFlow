import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { KeyDefinition, CategoryDefinition } from '../types';

interface KeyState {
  categories: CategoryDefinition[];
  definitions: Record<string, KeyDefinition>;
  definitionList: KeyDefinition[];
}

const initialState: KeyState = {
  categories: [],
  definitions: {},
  definitionList: [],
};

const keySlice = createSlice({
  name: 'key',
  initialState,
  reducers: {
    setCategories: (state, action: PayloadAction<CategoryDefinition[]>) => {
      state.categories = action.payload;
    },
    setDefinitions: (state, action: PayloadAction<KeyDefinition[]>) => {
      const defs: Record<string, KeyDefinition> = {};
      action.payload.forEach(def => {
        defs[def.name] = def;
      });
      state.definitions = defs;
      state.definitionList = action.payload;
    },
  },
});

export const { setCategories, setDefinitions } = keySlice.actions;
export default keySlice.reducer;
