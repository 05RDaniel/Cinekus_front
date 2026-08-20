import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';
import { LoginResponse, User } from '../models/auth.model';
import {
  getStoredUser,
  getToken,
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
  RegisterPayload,
} from '../services/auth.service';

type AuthContextValue = {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<LoginResponse>;
  register: (payload: RegisterPayload) => Promise<LoginResponse>;
  logout: () => void;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(getStoredUser());
  const [token, setToken] = useState<string | null>(getToken());

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      login: async (email: string, password: string) => {
        const response = await loginRequest(email, password);
        setUser(response.user);
        setToken(response.token);
        return response;
      },
      register: async (payload: RegisterPayload) => {
        const response = await registerRequest(payload);
        setUser(response.user);
        setToken(response.token);
        return response;
      },
      logout: () => {
        logoutRequest();
        setUser(null);
        setToken(null);
      },
    }),
    [user, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
