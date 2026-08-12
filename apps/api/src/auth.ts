import { betterAuth } from 'better-auth';
import { APIError } from 'better-auth/api';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { expo } from '@better-auth/expo';
import { db } from './db/index.js';
import * as schema from './db/auth-schema.js';
import { env } from './env.js';
import { logger } from './lib/logger.js';
import { ensureDefaultCategories } from './lib/seed.js';

export const auth = betterAuth({
  appName: 'financas',
  database: drizzleAdapter(db, { provider: 'pg', schema }),
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,

  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },

  // Só Google. Login por email/senha não existe neste app.
  emailAndPassword: { enabled: false },

  plugins: [expo()],

  trustedOrigins: [`${env.MOBILE_SCHEME}://`],

  rateLimit: { enabled: true, window: 60, max: 20 },

  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
  },

  advanced: {
    // Faz o Better Auth emitir UUID de verdade, para as tabelas de domínio
    // referenciarem `user.id` com uma FK `uuid`.
    database: { generateId: 'uuid' },
  },

  databaseHooks: {
    user: {
      create: {
        /**
         * A allowlist não é opcional. Sem ela, qualquer pessoa que descubra a
         * URL da API cria conta no banco.
         */
        before: async (candidate) => {
          const email = candidate.email.trim().toLowerCase();
          if (!env.ALLOWED_EMAILS.includes(email)) {
            logger.warn('tentativa de cadastro fora da allowlist');
            throw new APIError('FORBIDDEN', { message: 'Conta não autorizada.' });
          }
          return { data: { ...candidate, email } };
        },
        /**
         * Categoria padrão na criação do usuário. Se falhar, o cadastro segue:
         * `/me` refaz o seed de forma idempotente na primeira chamada.
         */
        after: async (created) => {
          try {
            const seeded = await ensureDefaultCategories(db, created.id);
            logger.info({ userId: created.id, seeded }, 'categorias padrão semeadas');
          } catch (error) {
            logger.error({ err: error, userId: created.id }, 'falha ao semear categorias');
          }
        },
      },
    },
  },
});

export type Auth = typeof auth;
export type Session = Auth['$Infer']['Session'];
