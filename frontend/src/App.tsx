import { Navigate, Route, Routes } from 'react-router';
import ErrorBoundary from './components/common/ErrorBoundary';
import AppLayout from './layouts/AppLayout';
import LibraryPage from './pages/LibraryPage';
import CategoriesPage from './pages/CategoriesPage';
import KeysPage from './pages/KeysPage';
import PluginsPage from './pages/PluginsPage';
import AIPage from './pages/AIPage';
import NotFoundPage from './pages/NotFoundPage';
import { initializePlugins } from './plugins';

initializePlugins();

function App() {
  return (
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
  );
}

export default App;
