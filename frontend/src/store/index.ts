import { configureStore } from '@reduxjs/toolkit';
import knowledgeReducer from './knowledgeSlice';
import libraryReducer from './librarySlice';
import catalogReducer from './catalogSlice';
import pluginsReducer from './pluginsSlice';

export const store = configureStore({
  reducer: {
    knowledge: knowledgeReducer,
    library: libraryReducer,
    catalog: catalogReducer,
    plugins: pluginsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
