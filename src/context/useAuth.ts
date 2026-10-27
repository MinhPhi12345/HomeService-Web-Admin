import { createContext, useContext } from 'react';
import type { AuthResponse } from '../types';

export interface AuthContextValue {
  user: AuthResponse | null;
  setUser: (user: AuthResponse | null) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth phải được dùng bên trong AuthProvider');
  return ctx;
}
