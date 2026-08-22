import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import DashboardPage from './features/dashboard/pages/DashboardPage';
import CatalogPage from './features/catalog/pages/CatalogPage';
import AdminCatalogPage from './features/catalog/pages/AdminCatalogPage';
import AdminUsersPage from './features/auth/pages/AdminUsersPage';
import LoginPage from './features/auth/pages/LoginPage';
import RegisterPage from './features/auth/pages/RegisterPage';
import { AddressManagementPage } from './features/addresses/pages/AddressManagementPage';
import CheckoutPage from './features/addresses/pages/CheckoutPage';
import { CartProvider } from './features/cart/hooks/use-cart';
import { AuthProvider } from './features/auth/hooks/use-auth';
import { SileoNotificationProvider } from './context/SileoNotificationContext';
import ProtectedRoute from './routes/ProtectedRoute';
import './styles/app-theme.css';
import './App.css';

function App() {
  return (
    <SileoNotificationProvider>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<MainLayout />}>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/catalog" element={<CatalogPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route
                  path="/addresses"
                  element={
                    <ProtectedRoute>
                      <AddressManagementPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute>
                      <CheckoutPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute roles={['admin']}>
                      <AdminUsersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/catalog"
                  element={
                    <ProtectedRoute roles={['admin']}>
                      <AdminCatalogPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </SileoNotificationProvider>
  );
}

export default App;
