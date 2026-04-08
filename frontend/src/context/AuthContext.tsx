// @refresh reset
import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { authService } from '@/services/auth.service';
import { LoginDto, RegisterDto, Role } from '@/types/api';

interface AuthUser {
  user_id: number;
  user_name: string;
  role: Role;
  trader_id: number | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (dto: LoginDto) => Promise<void>;
  /** Returns a pending message for VERIFIER, undefined for TRADER (auto-logged-in). */
  register: (dto: RegisterDto) => Promise<{ message: string } | undefined>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => authService.getStoredUser());

  const login = useCallback(async (dto: LoginDto) => {
    const result = await authService.login(dto);
    setUser(result);
  }, []);

  const register = useCallback(async (dto: RegisterDto) => {
    const result = await authService.register(dto);
    if ('user_id' in result) {
      // TRADER — auto-login after sign up
      setUser(result as AuthUser);
      return undefined;
    }
    // VERIFIER — pending approval
    return result as { message: string };
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: Boolean(user), login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
