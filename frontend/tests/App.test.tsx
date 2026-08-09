import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../src/App';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import knowledgeReducer from '../src/store/knowledgeSlice';
import keyReducer from '../src/store/keySlice';

// 模拟 API 调用（默认导出为 api 对象）
vi.mock('../src/services/api', () => {
  const mockApi = {
    fetchItems: vi.fn().mockResolvedValue([]),
    fetchCategories: vi.fn().mockResolvedValue([]),
    fetchKeys: vi.fn().mockResolvedValue([]),
  };
  return { api: mockApi, default: mockApi };
});

const createTestStore = () => {
  return configureStore({
    reducer: {
      knowledge: knowledgeReducer,
      key: keyReducer
    }
  });
};

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render App component', async () => {
    const store = createTestStore();

    render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    expect(await screen.findByText(/KnowFlow/i)).toBeInTheDocument();
  });

  it('should render Layout component', async () => {
    const store = createTestStore();

    render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    expect(await screen.findByRole('complementary')).toBeInTheDocument();
  });
});
