import type { ReactNode } from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router';
import { Provider } from 'react-redux';
import { App as AntdApp, ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { configureStore } from '@reduxjs/toolkit';
import libraryReducer from '../../src/store/librarySlice';
import catalogReducer from '../../src/store/catalogSlice';
import pluginsReducer from '../../src/store/pluginsSlice';
import { antdTheme } from '../../src/theme';

const testTheme = {
  ...antdTheme,
  token: { ...antdTheme.token, motion: false },
};

export function createTestStore(preloadedState?: Record<string, unknown>) {
  return configureStore({
    reducer: {
      library: libraryReducer,
      catalog: catalogReducer,
      plugins: pluginsReducer,
    },
    preloadedState,
  });
}

export type TestStore = ReturnType<typeof createTestStore>;

export const LocationProbe = () => {
  const location = useLocation();
  return <span data-testid="location-search">{location.search}</span>;
};

interface RenderOptions {
  route?: string;
  store?: TestStore;
}

export function renderWithProviders(
  children: ReactNode,
  { route = '/', store = createTestStore() }: RenderOptions = {},
) {
  return render(
    <ConfigProvider theme={testTheme} locale={zhCN}>
      <AntdApp>
        <Provider store={store}>
          <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
        </Provider>
      </AntdApp>
    </ConfigProvider>,
  );
}
