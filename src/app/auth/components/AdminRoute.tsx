import { Navigate, useLocation } from 'react-router-dom';
import { PropsWithChildren } from 'react';
import { useAuth } from '../../auth/context/AuthContext';

export function AdminRoute({ children }: PropsWithChildren) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (user?.rol !== 'ADMIN') {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
}
