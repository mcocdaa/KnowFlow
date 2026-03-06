import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface KeyCategory {
  id: string;
  name: string;
  parentId: string | null;
  isBuiltin: boolean;
}

interface KeyDefinition {
  id: string;
  name: string;
  categoryId: string;
  isBuiltin: boolean;
  script: string;
  description: string;
  [key: string]: any; // 支持任意额外信息
}

interface KeyState {
  categories: KeyCategory[];
  definitions: KeyDefinition[];
}

const initialState: KeyState = {
  categories: [
    { id: '1', name: '内置 Key', parentId: null, isBuiltin: true },
    { id: '2', name: '基础属性', parentId: '1', isBuiltin: true },
    { id: '3', name: '统计属性', parentId: '1', isBuiltin: true },
    { id: '4', name: '评价属性', parentId: '1', isBuiltin: true },
    { id: '5', name: '时间属性', parentId: '1', isBuiltin: true },
    { id: '6', name: '媒体属性', parentId: '1', isBuiltin: true },
    { id: '7', name: '文献属性', parentId: '1', isBuiltin: true },
    { id: '8', name: '自定义 Key', parentId: null, isBuiltin: false },
  ],
  definitions: [
    { id: '1', name: 'file_path', categoryId: '2', isBuiltin: true, script: '', description: '文件路径' },
    { id: '2', name: 'file_type', categoryId: '2', isBuiltin: true, script: '', description: '文件类型' },
    { id: '3', name: 'click_count', categoryId: '3', isBuiltin: true, script: '', description: '点击次数' },
    { id: '4', name: 'star_rating', categoryId: '4', isBuiltin: true, script: '', description: '星级' },
    { id: '5', name: 'created_at', categoryId: '5', isBuiltin: true, script: '', description: '创建时间' },
    { id: '6', name: 'image_resolution', categoryId: '6', isBuiltin: true, script: '', description: '图片分辨率' },
    { id: '7', name: 'video_duration', categoryId: '6', isBuiltin: true, script: '', description: '视频时长' },
    { id: '8', name: 'author', categoryId: '7', isBuiltin: true, script: '', description: '作者' },
    { id: '9', name: 'publication_date', categoryId: '7', isBuiltin: true, script: '', description: '发表日期' },
  ],
};

const keySlice = createSlice({
  name: 'key',
  initialState,
  reducers: {
    addCategory: (state, action: PayloadAction<Omit<KeyCategory, 'id'>>) => {
      const newId = (state.categories.length + 1).toString();
      state.categories.push({ ...action.payload, id: newId });
    },
    updateCategory: (state, action: PayloadAction<KeyCategory>) => {
      const index = state.categories.findIndex(cat => cat.id === action.payload.id);
      if (index !== -1) {
        state.categories[index] = action.payload;
      }
    },
    deleteCategory: (state, action: PayloadAction<string>) => {
      state.categories = state.categories.filter(cat => cat.id !== action.payload && cat.parentId !== action.payload);
    },
    setCategories: (state, action: PayloadAction<KeyCategory[]>) => {
      state.categories = action.payload;
    },
    addKeyDefinition: (state, action: PayloadAction<{ id?: string; name: string; categoryId: string; isBuiltin: boolean; script: string; description: string; dataType?: string }>) => {
      const newId = action.payload.id || (state.definitions.length + 1).toString();
      state.definitions.push({ 
        ...action.payload, 
        id: newId, 
        createdAt: new Date().toISOString(),
        dataType: action.payload.dataType || 'string' // 默认数据类型为string
      });
    },
    updateKeyDefinition: (state, action: PayloadAction<KeyDefinition>) => {
      const index = state.definitions.findIndex(def => def.id === action.payload.id);
      if (index !== -1) {
        state.definitions[index] = { ...action.payload, updatedAt: new Date().toISOString() };
      }
    },
    deleteKeyDefinition: (state, action: PayloadAction<string>) => {
      state.definitions = state.definitions.filter(def => def.id !== action.payload);
    },
    setDefinitions: (state, action: PayloadAction<KeyDefinition[]>) => {
      state.definitions = action.payload;
    },
  },
});

export const { addCategory, updateCategory, deleteCategory, setCategories, addKeyDefinition, updateKeyDefinition, deleteKeyDefinition, setDefinitions } = keySlice.actions;
export default keySlice.reducer;