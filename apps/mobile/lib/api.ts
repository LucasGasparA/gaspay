import { getSessionCookie } from './auth-client';
import { apiUrl } from './config';

interface ErrorBody {
  error: string;
  requestId: string;
  fields?: Record<string, string>;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly requestId?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Rotas próprias (fora do `/api/auth/*` do Better Auth) não recebem cookie
 * automaticamente no Expo — precisa anexar na mão. É o padrão documentado do
 * plugin `@better-auth/expo`.
 */
export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const cookie = getSessionCookie();

  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(cookie ? { Cookie: cookie } : {}),
      ...init.headers,
    },
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ErrorBody | null;
    throw new ApiError(response.status, body?.error ?? 'Erro na API', body?.requestId);
  }

  if (response.status === 204) return undefined as T;

  return (await response.json()) as T;
}
