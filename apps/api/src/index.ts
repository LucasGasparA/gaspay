import { serve } from '@hono/node-server';
import { createApp } from './app.js';
import { pool } from './db/index.js';
import { env } from './env.js';
import { logger } from './lib/logger.js';

const server = serve({ fetch: createApp().fetch, port: env.PORT, hostname: '0.0.0.0' }, (info) => {
  logger.info({ port: info.port, env: env.NODE_ENV }, 'api no ar');
});

/**
 * O Railway manda SIGTERM antes de trocar a versão. Fechar o servidor e o pool
 * evita request cortado no meio e conexão pendurada no Postgres.
 */
async function shutdown(signal: string): Promise<void> {
  logger.info({ signal }, 'encerrando');
  server.close(() => undefined);
  await pool.end().catch((error) => logger.error({ err: error }, 'falha ao fechar o pool'));
  process.exit(0);
}

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.fatal({ err: reason }, 'promise rejeitada sem tratamento');
  process.exit(1);
});
