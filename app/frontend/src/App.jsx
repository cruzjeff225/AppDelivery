import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import DashboardPage from './features/dashboard/pages/DashboardPage';
import CatalogPage from './features/catalog/pages/CatalogPage';
import AdminCatalogPage from './features/catalog/pages/AdminCatalogPage';
import AdminUsersPage from './features/auth/pages/AdminUsersPage';
import { AddressManagementPage } from './features/addresses/pages/AddressManagementPage';
import CheckoutPage from './features/addresses/pages/CheckoutPage';
import { CartProvider } from './features/cart/hooks/use-cart';
import { SileoNotificationProvider } from './context/SileoNotificationContext';
import './styles/app-theme.css';
import './App.css';

function App() {
  return (
    <SileoNotificationProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/catalog" element={<CatalogPage />} />
              <Route path="/addresses" element={<AddressManagementPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route path="/admin/catalog" element={<AdminCatalogPage />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </SileoNotificationProvider>
  );
}

export default App;
