import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../src/App';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import knowledgeReducer from '../src/store/knowledgeSlice';
import keyReducer from '../src/store/keySlice';

// 模拟electron
vi.mock('electron', () => ({
  ipcRenderer: {
    on: vi.fn(),
    send: vi.fn()
  }
}));

// 模拟API调用
vi.mock('../src/services/api', () => ({
  fetchKnowledge: vi.fn().mockResolvedValue([]),
  fetchCategories: vi.fn().mockResolvedValue([]),
  fetchKeys: vi.fn().mockResolvedValue([])
}));

const createTestStore = () => {
  return configureStore({
    reducer: {
      knowledge: knowledgeReducer,
      key: keyReducer
    }
  });
};

describe('App Component', () => {
  it('should render App component', () => {
    const store = createTestStore();
    
    render(
      <Provider store={store}>
        <App />
      </Provider>
    );
    
    // 检查App是否渲染
    expect(screen.getByText(/KnowFlow/i)).toBeInTheDocument();
  });

  it('should render Layout component', () => {
    const store = createTestStore();
    
    render(
      <Provider store={store}>
        <App />
      </Provider>
    );
    
    // 检查Layout是否渲染（侧边栏角色是complementary）
    expect(screen.getByRole('complementary')).toBeInTheDocument();
  });
});
