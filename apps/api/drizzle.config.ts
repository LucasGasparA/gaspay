import { defineConfig } from 'drizzle-kit';

// Este arquivo roda fora do processo da API (drizzle-kit CLI), então lê
// process.env direto. Todo o resto do projeto passa por src/env.ts.
// `drizzle-kit generate` não conecta no banco — só compara o schema com o
// snapshot em ./drizzle. Por isso o fallback: dá para gerar migration sem ter
// Postgres à mão. `migrate`, `push` e `studio` conectam e falham sem a URL real.
const url = process.env.DATABASE_URL ?? 'postgresql://localhost:5432/financas';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  casing: 'snake_case',
  dbCredentials: { url },
  strict: true,
  verbose: true,
});
