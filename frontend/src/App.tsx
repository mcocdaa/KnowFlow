import { Provider } from 'react-redux';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { store } from './store';
import Layout from './components/Layout';
import { antdTheme } from './theme';
import { initializePlugins } from './plugins';
import './App.css';

initializePlugins();

function App() {
  return (
    <ConfigProvider 
      theme={antdTheme}
      locale={zhCN}
    >
      <Provider store={store}>
        <Layout />
      </Provider>
    </ConfigProvider>
  );
}

export default App;
