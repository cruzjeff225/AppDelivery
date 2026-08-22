import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/use-auth';

export default function ProtectedRoute({ roles, children }) {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (roles && !roles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
