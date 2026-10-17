import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import enUS from 'antd/locale/en_US';
import { Navigate, Route, Routes } from 'react-router';
import ErrorBoundary from './components/common/ErrorBoundary';
import { LanguageProvider, useI18n } from './i18n';
import AppLayout from './layouts/AppLayout';
import LibraryPage from './pages/LibraryPage';
import CategoriesPage from './pages/CategoriesPage';
import KeysPage from './pages/KeysPage';
import PluginsPage from './pages/PluginsPage';
import AIPage from './pages/AIPage';
import NotFoundPage from './pages/NotFoundPage';
import { initializePlugins } from './plugins';

initializePlugins();

function AppContent() {
  const { locale } = useI18n();

  return (
    <ConfigProvider locale={locale === 'zh' ? zhCN : enUS}>
      <ErrorBoundary>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/library" replace />} />
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/keys" element={<KeysPage />} />
            <Route path="/plugins" element={<PluginsPage />} />
            <Route path="/ai" element={<AIPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </ErrorBoundary>
    </ConfigProvider>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;
