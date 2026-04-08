import { api, userStorage } from '@/lib/api';
import { LoginDto, RegisterDto, Role } from '@/types/api';

interface AuthUser {
  user_id: number;
  user_name: string;
  role: Role;
  trader_id: number | null;
}

export const authService = {
  /** Returns user info on success. Tokens are set as HttpOnly cookies by the backend. */
  async login(dto: LoginDto): Promise<AuthUser> {
    const user = await api.post<AuthUser>('/auth/login', dto);
    userStorage.set(user);
    return user;
  },

  /** TRADER: returns user info (auto-login). VERIFIER: returns { message }. */
  async register(dto: RegisterDto): Promise<AuthUser | { message: string }> {
    const result = await api.post<AuthUser | { message: string }>('/auth/register', dto);
    if ('user_id' in result) {
      userStorage.set(result as AuthUser);
    }
    return result;
  },

  /** Clears HttpOnly cookies server-side and removes local user info. */
  async logout(): Promise<void> {
    await api.post('/auth/logout').catch(() => {});
    userStorage.clear();
  },

  getStoredUser(): AuthUser | null {
    return userStorage.get() as AuthUser | null;
  },
};
