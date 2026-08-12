import { createMiddleware } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';
import { env } from '../env.js';
import type { AppEnv } from '../types.js';

const WINDOW_MS = 60_000;

interface Bucket {
  count: number;
  resetAt: number;
}

/**
 * Janela fixa de 1 minuto por IP, em memória.
 *
 * O app roda em um serviço só, com um usuário só — não vale um Redis. O Better
 * Auth tem o próprio rate limit, mais apertado, nas rotas de autenticação.
 */
const buckets = new Map<string, Bucket>();

function clientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  return headers.get('x-real-ip') ?? 'desconhecido';
}

function sweep(now: number): void {
  if (buckets.size < 1_000) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export const rateLimit = createMiddleware<AppEnv>(async (c, next) => {
  const now = Date.now();
  const key = clientIp(c.req.raw.headers);

  sweep(now);

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
  } else if (bucket.count >= env.RATE_LIMIT_PER_MINUTE) {
    const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
    c.header('Retry-After', String(retryAfter));
    throw new HTTPException(429, { message: 'Muitas requisições. Tente de novo em instantes.' });
  } else {
    bucket.count += 1;
  }

  await next();
});

/** Usado só nos testes, para não vazar estado entre casos. */
export function resetRateLimit(): void {
  buckets.clear();
}
