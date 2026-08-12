import { Hono } from 'hono';
import { db } from '../db/index.js';
import { ensureDefaultCategories } from '../lib/seed.js';
import { requireSession } from '../middleware/session.js';
import type { AppEnv } from '../types.js';

export const meRoutes = new Hono<AppEnv>();

meRoutes.use('*', requireSession);

/**
 * Quem sou eu. É o que o app chama no boot para saber se a sessão guardada no
 * SecureStore ainda vale.
 *
 * Aproveita para garantir o seed de categorias: se o hook de criação de usuário
 * falhou, é aqui que o app se recupera sozinho.
 */
meRoutes.get('/', async (c) => {
  const user = c.get('user');
  const session = c.get('session');

  await ensureDefaultCategories(db, user.id);

  return c.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image ?? null,
    },
    session: {
      expiresAt: new Date(session.expiresAt).toISOString(),
    },
  });
});
