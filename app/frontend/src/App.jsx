import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import CatalogPage      from './features/catalog/pages/CatalogPage';
import AdminCatalogPage from './features/catalog/pages/AdminCatalogPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <nav className="app-nav">
        <Link to="/catalog" className="app-nav__logo">🛵 AppDelivery</Link>
        <div className="app-nav__links">
          <Link to="/catalog"       className="app-nav__link">Catálogo</Link>
          <Link to="/admin/catalog" className="app-nav__link app-nav__link--admin">Admin</Link>
        </div>
      </nav>

      <main className="app-main">
        <Routes>
          <Route path="/"               element={<Navigate to="/catalog" replace />} />
          <Route path="/catalog"        element={<CatalogPage />} />
          <Route path="/admin/catalog"  element={<AdminCatalogPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
