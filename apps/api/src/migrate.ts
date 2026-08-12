import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { db, pool } from './db/index.js';
import { logger } from './lib/logger.js';

/**
 * Aplica as migrations no boot do deploy.
 *
 * Roda como binário próprio (`node dist/migrate.js`) em vez de `drizzle-kit
 * migrate` para não precisar do drizzle-kit — nem do TypeScript — na imagem de
 * produção.
 */
const here = path.dirname(fileURLToPath(import.meta.url));
const migrationsFolder = path.resolve(here, '../drizzle');

try {
  await migrate(db, { migrationsFolder });
  logger.info({ migrationsFolder }, 'migrations aplicadas');
  await pool.end();
  process.exit(0);
} catch (error) {
  logger.error({ err: error }, 'falha ao aplicar migrations');
  await pool.end().catch(() => undefined);
  process.exit(1);
}
