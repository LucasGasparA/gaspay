import { HTTPException } from 'hono/http-exception';
import type { ErrorHandler, NotFoundHandler } from 'hono';
import { ZodError } from 'zod';
import { logger } from '../lib/logger.js';
import type { AppEnv } from '../types.js';

export interface ErrorBody {
  error: string;
  requestId: string;
  /** Só em erro de validação: campo → mensagem. */
  fields?: Record<string, string>;
}

/**
 * Nunca devolve stack trace ao cliente. O detalhe vai para o log junto do
 * `requestId`, que é a única coisa que o cliente recebe para correlacionar.
 */
export const onError: ErrorHandler<AppEnv> = (err, c) => {
  const requestId = c.get('requestId') ?? 'sem-id';

  if (err instanceof HTTPException) {
    if (err.status >= 500) {
      logger.error({ err, requestId, path: c.req.path }, 'erro http');
    }
    return c.json<ErrorBody>({ error: err.message, requestId }, err.status);
  }

  if (err instanceof ZodError) {
    const fields: Record<string, string> = {};
    for (const issue of err.issues) {
      fields[issue.path.join('.') || '_'] = issue.message;
    }
    return c.json<ErrorBody>({ error: 'Dados inválidos.', requestId, fields }, 400);
  }

  logger.error({ err, requestId, path: c.req.path, method: c.req.method }, 'erro não tratado');
  return c.json<ErrorBody>({ error: 'Algo deu errado do nosso lado.', requestId }, 500);
};

export const onNotFound: NotFoundHandler<AppEnv> = (c) =>
  c.json<ErrorBody>({ error: 'Rota não encontrada.', requestId: c.get('requestId') ?? 'sem-id' }, 404);
