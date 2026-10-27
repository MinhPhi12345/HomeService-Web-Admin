import { useState, type ReactNode } from 'react';
import type { AuthResponse } from '../types';
import { AuthContext } from './useAuth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<AuthResponse | null>(() => {
    const raw = localStorage.getItem('adminUser');
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as AuthResponse;
      if (parsed.expiresAt && new Date(parsed.expiresAt) <= new Date()) {
        localStorage.removeItem('adminUser');
        localStorage.removeItem('accessToken');
        return null;
      }
      return parsed;
    } catch {
      localStorage.removeItem('adminUser');
      localStorage.removeItem('accessToken');
      return null;
    }
  });

  function setUser(next: AuthResponse | null) {
    setUserState(next);
    if (next) {
      localStorage.setItem('adminUser', JSON.stringify(next));
      localStorage.setItem('accessToken', next.accessToken);
    } else {
      localStorage.removeItem('adminUser');
      localStorage.removeItem('accessToken');
    }
  }

  function logout() {
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
