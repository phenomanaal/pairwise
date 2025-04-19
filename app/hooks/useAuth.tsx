'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';

interface User {
  username: string;
  role: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (username: string, oneTimePassword: string) => Promise<boolean>;
  verifyAccessCode: (accessCode: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loading: boolean;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const checkAuth = async () => {
    try {
      const response = await fetch(
        'http://localhost:3001/pairwise/auth-check',
        {
          method: 'GET',
          credentials: 'include',
        },
      );

      if (response.ok) {
        const data = await response.json();
        setIsAuthenticated(true);
        setUser(data.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Auth check error:', error);
      return false;
    }
  };

  useEffect(() => {
    const initialAuthCheck = async () => {
      try {
        await checkAuth();
      } finally {
        setLoading(false);
      }
    };

    initialAuthCheck();
  }, []);

  const login = async (username: string, oneTimePassword: string) => {
    try {
      const response = await fetch('http://localhost:3001/pairwise/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, oneTimePassword }),
        credentials: 'include',
      });

      return response.ok;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const verifyAccessCode = async (accessCode: string) => {
    try {
      const response = await fetch(
        'http://localhost:3001/pairwise/verify-access-code',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ accessCode }),
          credentials: 'include',
        },
      );

      if (response.ok) {
        await checkAuth();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Access code verification error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await fetch('http://localhost:3001/pairwise/logout', {
        method: 'POST',
        credentials: 'include',
      });

      setIsAuthenticated(false);
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        verifyAccessCode,
        logout,
        loading,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const runAuth = () => {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { isAuthenticated, checkAuth } = useAuth();

  useEffect(() => {
    const verifyAuth = async () => {
      setIsLoading(true);
      const authenticated = await checkAuth();
      if (!authenticated) {
        router.push('/login');
      }
      setIsLoading(false);
    };

    verifyAuth();
  }, [router, checkAuth]);
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
