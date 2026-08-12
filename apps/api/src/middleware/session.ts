import { createMiddleware } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';
import type { Context } from 'hono';
import { auth } from '../auth.js';
import type { AppEnv } from '../types.js';

/**
 * Rejeita qualquer request sem sessão válida e injeta `user`/`session` no
 * contexto. É o único caminho pelo qual um `userId` entra na aplicação.
 */
export const requireSession = createMiddleware<AppEnv>(async (c, next) => {
  const result = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!result?.user) {
    throw new HTTPException(401, { message: 'Sessão expirada ou inválida.' });
  }

  c.set('user', result.user);
  c.set('session', result.session);

  await next();
});

/**
 * A única origem de `userId` no projeto inteiro.
 *
 * Se o cliente mandar `userId` no body ou na query, esse valor é ignorado: os
 * schemas Zod são `.strict()` e nenhum deles declara o campo, então a request
 * nem chega aqui.
 */
export function currentUserId(c: Context<AppEnv>): string {
  return c.get('user').id;
}
