import { configureStore } from '@reduxjs/toolkit';
import keyReducer from './keySlice';
import knowledgeReducer from './knowledgeSlice';
import libraryReducer from './librarySlice';
import catalogReducer from './catalogSlice';
import pluginsReducer from './pluginsSlice';

export const store = configureStore({
  reducer: {
    key: keyReducer,
    knowledge: knowledgeReducer,
    library: libraryReducer,
    catalog: catalogReducer,
    plugins: pluginsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
