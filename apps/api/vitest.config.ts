import { defineConfig } from 'vitest/config';

// Testes de integração batem no Postgres real (via `db/index.ts`) — não há
// nada pra mockar, o requisito é provar isolamento por userId na query de
// verdade. `setupFiles` carrega o `.env` antes de qualquer import de `env.ts`.
export default defineConfig({
  test: {
    setupFiles: ['./src/test/setup.ts'],
  },
});
