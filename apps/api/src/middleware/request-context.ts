import { randomUUID } from 'node:crypto';
import { createMiddleware } from 'hono/factory';
import { logger } from '../lib/logger.js';
import type { AppEnv } from '../types.js';

/**
 * Gera o id de correlação e loga o request. Sem body, sem query string —
 * a query pode carregar termo de busca, e a busca pode carregar valor.
 */
export const requestContext = createMiddleware<AppEnv>(async (c, next) => {
  const requestId = c.req.header('x-request-id') ?? randomUUID();
  c.set('requestId', requestId);
  c.header('x-request-id', requestId);

  const startedAt = Date.now();
  await next();

  logger.info(
    {
      requestId,
      method: c.req.method,
      path: c.req.path,
      status: c.res.status,
      ms: Date.now() - startedAt,
    },
    'request',
  );
});
