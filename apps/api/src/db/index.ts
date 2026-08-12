import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { env, isProduction } from '../env.js';
import * as schema from './schema.js';

/**
 * O Railway serve o Postgres pela rede privada, sem TLS. O docker-compose
 * local também: o serviço `postgres` fala com a API dentro da mesma rede
 * Docker, sem TLS. Fora desses casos (túnel, banco gerenciado externo) o TLS
 * entra sem verificação de CA, que é o que os provedores gerenciados expõem.
 */
const usesPrivateNetwork =
  env.DATABASE_URL.includes('.railway.internal') ||
  env.DATABASE_URL.includes('localhost') ||
  env.DATABASE_URL.includes('@postgres:');

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
  ...(isProduction && !usesPrivateNetwork ? { ssl: { rejectUnauthorized: false } } : {}),
});

export const db = drizzle(pool, { schema, casing: 'snake_case' });

export type Database = typeof db;

export { schema };
