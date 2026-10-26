import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { UserRole } from '../types';
import type { ReactNode } from 'react';

export default function RequireAuth({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user || !user.accessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.expiresAt && new Date(user.expiresAt) <= new Date()) {
    logout();
    sessionStorage.setItem(
      'auth_message',
      'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
    );
    return <Navigate to="/login" replace />;
  }

  if (user.role !== UserRole.Admin) {
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
}
