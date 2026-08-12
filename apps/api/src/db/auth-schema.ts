import { boolean, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

/**
 * Tabelas do Better Auth.
 *
 * Os nomes das propriedades precisam bater exatamente com os nomes de campo do
 * Better Auth (camelCase) — é assim que o `drizzleAdapter` resolve o mapeamento.
 * Só os nomes de coluna são snake_case.
 *
 * Os ids são `uuid` de verdade (e não o `text` que o Better Auth usa por
 * padrão) porque `auth.ts` liga `advanced.database.generateId: 'uuid'`. Isso
 * permite que as tabelas de domínio referenciem `user.id` com FK tipada.
 *
 * A tabela de conta OAuth se chama `account` (singular, do Better Auth); a
 * conta bancária do domínio é `accounts` (plural). Não confundir.
 */
export const user = pgTable('user', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified')
    .$defaultFn(() => false)
    .notNull(),
  image: text('image'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .$defaultFn(() => new Date())
    .notNull(),
});

export const session = pgTable('session', {
  id: uuid('id').primaryKey().defaultRandom(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .$defaultFn(() => new Date())
    .notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: uuid('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
});

export const account = pgTable('account', {
  id: uuid('id').primaryKey().defaultRandom(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: uuid('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at', { withTimezone: true }),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at', { withTimezone: true }),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .$defaultFn(() => new Date())
    .notNull(),
});

export const verification = pgTable('verification', {
  id: uuid('id').primaryKey().defaultRandom(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .$defaultFn(() => new Date())
    .notNull(),
});
