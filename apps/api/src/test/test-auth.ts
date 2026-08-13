import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { testUtils } from 'better-auth/plugins';
import { db } from '../db/index.js';
import * as schema from '../db/auth-schema.js';
import { env } from '../env.js';

/**
 * Instância separada da de produção (`../auth.ts`), só pra teste. Mesma
 * conexão de banco e mesmo `secret` — as sessões que ela cria via `testUtils`
 * precisam validar contra o `requireSession` real, que usa a instância de
 * produção pra verificar o cookie assinado.
 */
export const testAuth = betterAuth({
  database: drizzleAdapter(db, { provider: 'pg', schema }),
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  emailAndPassword: { enabled: false },
  plugins: [testUtils()],
  advanced: {
    database: { generateId: 'uuid' },
  },
});
