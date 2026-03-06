import { configureStore } from '@reduxjs/toolkit';
import keyReducer from './keySlice';
import knowledgeReducer from './knowledgeSlice';

export const store = configureStore({
  reducer: {
    key: keyReducer,
    knowledge: knowledgeReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;