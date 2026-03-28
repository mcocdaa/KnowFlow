import { Provider } from 'react-redux';
import { ConfigProvider, App as AntdApp } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { store } from './store';
import { MainPage } from './pages';
import { antdTheme } from './theme';
import { initializePlugins } from './plugins';
import './styles/App.css';

initializePlugins();

function App() {
  return (
    <ConfigProvider
      theme={antdTheme}
      locale={zhCN}
    >
      <AntdApp>
        <Provider store={store}>
          <MainPage />
        </Provider>
      </AntdApp>
    </ConfigProvider>
  );
}

export default App;
