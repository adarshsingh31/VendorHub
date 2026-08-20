import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

/**
 * AuthProvider — wraps the entire app.
 * Reads initial auth state from localStorage so the user stays logged in
 * across page refreshes.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('vh_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('vh_token') || null);

  /**
   * login({ token, user }) — called after a successful auth response.
   * Persists to localStorage and updates React state.
   */
  const login = useCallback(({ token: newToken, user: newUser }) => {
    localStorage.setItem('vh_token', newToken);
    localStorage.setItem('vh_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  /**
   * logout() — clears all auth data and reloads to /login.
   */
  const logout = useCallback(() => {
    localStorage.removeItem('vh_token');
    localStorage.removeItem('vh_user');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  }, []);

  /**
   * refreshUser(newUser) — updates the stored user object without issuing a
   * full login. Called after admin approves a seller application so the buyer's
   * role propagates to 'seller' immediately.
   */
  const refreshUser = useCallback((newUser) => {
    localStorage.setItem('vh_user', JSON.stringify(newUser));
    setUser(newUser);
  }, []);

  const isAuthenticated = Boolean(token && user);
  const role = user?.role || null; // 'buyer' | 'seller' | 'admin'

  return (
    <AuthContext.Provider value={{ user, token, login, logout, refreshUser, isAuthenticated, role }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth() — consume the auth context anywhere in the app.
 * Throws if used outside <AuthProvider>.
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
