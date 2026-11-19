import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api, TOKEN_STORAGE_KEY } from '@/services/api';
import { User, RegisterDonorPayload, RegisterHospitalPayload } from '@/types';

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  registerDonor: (data: RegisterDonorPayload | Record<string, unknown>) => Promise<void>;
  registerHospital: (data: RegisterHospitalPayload | Record<string, unknown>) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    return typeof window !== 'undefined' ? localStorage.getItem(TOKEN_STORAGE_KEY) : null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize and check current user on mount
  useEffect(() => {
    const checkCurrentUser = async () => {
      const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        setToken(storedToken);
        const response = await api.get('/auth/me');
        const userData = response.data?.data?.user || response.data?.user || response.data?.data;
        if (userData) {
          setUser(userData);
        } else {
          throw new Error('User profile data missing in response');
        }
      } catch (error) {
        console.warn('LifeLink Auth: Stored token verification failed', error);
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkCurrentUser();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const payload = response.data?.data || response.data;
      const receivedToken = payload.token;
      const receivedUser = payload.user;

      if (!receivedToken || !receivedUser) {
        throw new Error('Invalid credentials or response payload');
      }

      localStorage.setItem(TOKEN_STORAGE_KEY, receivedToken);
      setToken(receivedToken);
      setUser(receivedUser);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const registerDonor = useCallback(
    async (data: RegisterDonorPayload | Record<string, unknown>): Promise<void> => {
      setIsLoading(true);
      try {
        const response = await api.post('/auth/register/donor', data);
        const payload = response.data?.data || response.data;
        if (payload?.token && payload?.user) {
          localStorage.setItem(TOKEN_STORAGE_KEY, payload.token);
          setToken(payload.token);
          setUser(payload.user);
        }
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const registerHospital = useCallback(
    async (data: RegisterHospitalPayload | Record<string, unknown>): Promise<void> => {
      setIsLoading(true);
      try {
        const response = await api.post('/auth/register/hospital', data);
        const payload = response.data?.data || response.data;
        if (payload?.token && payload?.user) {
          localStorage.setItem(TOKEN_STORAGE_KEY, payload.token);
          setToken(payload.token);
          setUser(payload.user);
        }
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logout = useCallback((): void => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((userData: Partial<User>): void => {
    setUser((prev) => (prev ? { ...prev, ...userData } : null));
  }, []);

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: Boolean(token && user),
    login,
    registerDonor,
    registerHospital,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
