import { Hono } from 'hono';
import { pool } from '../db/index.js';
import { logger } from '../lib/logger.js';
import type { AppEnv } from '../types.js';

const startedAt = Date.now();

export const healthRoutes = new Hono<AppEnv>();

/**
 * Health check do Railway. Público de propósito — é o que o deploy consulta
 * antes de trocar a versão no ar.
 *
 * Verifica o banco: se o Postgres não responde, o deploy não deve subir. O
 * `select 1` vai direto no pool (não é query de domínio — não tem tabela nem
 * `userId` envolvidos).
 */
healthRoutes.get('/health', async (c) => {
  const uptimeSeconds = Math.floor((Date.now() - startedAt) / 1000);

  try {
    await pool.query('select 1');
  } catch (error) {
    logger.error({ err: error }, 'health check: banco indisponível');
    return c.json({ status: 'degraded', database: 'down', uptimeSeconds }, 503);
  }

  return c.json({ status: 'ok', database: 'up', uptimeSeconds }, 200);
});
