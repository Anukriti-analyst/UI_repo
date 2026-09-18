import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export interface AuthUser {
  userId: string;
  email: string;
  role: 'Admin' | 'General';
  displayName: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  login: (role: 'Admin' | 'General') => void;
  logout: () => void;
}

const ADMIN_USER: AuthUser = {
  userId: '65CE5B0B-9B1E-4D86-A388-8BA7D8869128',
  email: 'admin@example.com',
  role: 'Admin',
  displayName: 'Administrator',
};

const GENERAL_USER: AuthUser = {
  userId: 'ABA209AE-6EE2-46B9-8939-A046C7E85DFA',
  email: 'user@example.com',
  role: 'General',
  displayName: 'General User',
};

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = 'fm_auth_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  const login = useCallback((role: 'Admin' | 'General') => {
    const selectedUser = role === 'Admin' ? ADMIN_USER : GENERAL_USER;
    // Write to localStorage so API client can read auth headers,
    // but we do NOT load from localStorage on init → always starts at login.
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedUser));
    setUser(selectedUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isAdmin: user?.role === 'Admin',
      isAuthenticated: user !== null,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
