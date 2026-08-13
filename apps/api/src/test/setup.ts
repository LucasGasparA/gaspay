import { existsSync } from 'node:fs';

// `env.ts` valida `process.env` no import — sem isso os testes morrem com
// "Configuração inválida" porque nada carrega o `.env` sozinho fora do boot
// normal da API (que passa por um processo separado, `tsx`/`node`).
if (existsSync('.env')) {
  process.loadEnvFile('.env');
}
