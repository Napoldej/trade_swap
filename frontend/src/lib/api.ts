import { ApiError } from '@/types/api';

export const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

// ─── User info stored in localStorage (non-sensitive, just for UI) ────────────

export const userStorage = {
  get: (): { user_id: number; user_name: string; role: string; trader_id: number | null } | null => {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  },
  set: (user: { user_id: number; user_name: string; role: string; trader_id?: number | null }) => {
    localStorage.setItem('user', JSON.stringify(user));
  },
  clear: () => localStorage.removeItem('user'),
};

// ─── Core fetch wrapper ───────────────────────────────────────────────────────

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
}

export class ApiException extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly raw?: ApiError,
  ) {
    super(message);
    this.name = 'ApiException';
  }
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers: extraHeaders, ...rest } = options;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...rest,
    credentials: 'include', // send & receive HttpOnly cookies automatically
    headers: {
      'Content-Type': 'application/json',
      ...(extraHeaders as Record<string, string>),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const err = data as ApiError;
    const message = Array.isArray(err.message)
      ? err.message.join(', ')
      : err.message ?? `HTTP ${response.status}`;
    throw new ApiException(response.status, message, err);
  }

  return data as T;
}

export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { method: 'GET', ...options }),

  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, { method: 'POST', body, ...options }),

  patch: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, { method: 'PATCH', body, ...options }),

  put: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, { method: 'PUT', body, ...options }),

  delete: <T = void>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { method: 'DELETE', ...options }),
};
