import { z } from 'zod';

/**
 * Toda variável de ambiente passa por aqui no boot. Se faltar alguma, o
 * processo morre imediatamente com a lista do que falta — nunca em produção
 * no meio de um request.
 *
 * Este é o único lugar do projeto onde `process.env` é lido.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL é obrigatória'),

  BETTER_AUTH_SECRET: z
    .string()
    .min(32, 'BETTER_AUTH_SECRET precisa de pelo menos 32 caracteres (openssl rand -base64 32)'),
  BETTER_AUTH_URL: z.url('BETTER_AUTH_URL precisa ser uma URL absoluta'),

  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),

  /**
   * Allowlist de emails. Sem ela qualquer pessoa que descubra a URL cria conta.
   * Não é opcional: o schema exige pelo menos um email.
   */
  ALLOWED_EMAILS: z
    .string()
    .min(1, 'ALLOWED_EMAILS é obrigatória — sem allowlist qualquer um cria conta')
    .transform((value) =>
      value
        .split(',')
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean),
    )
    .refine((emails) => emails.length > 0, 'ALLOWED_EMAILS não pode ficar vazia'),

  /** Scheme do deep link do app. Precisa bater com o `scheme` do app.config.ts. */
  MOBILE_SCHEME: z.string().min(1).default('dindim'),

  /** Teto do rate limit global, em requests por minuto por IP. */
  RATE_LIMIT_PER_MINUTE: z.coerce.number().int().min(1).default(100),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `  - ${issue.path.join('.') || '(raiz)'}: ${issue.message}`)
      .join('\n');
    // Sem logger aqui: ele depende do env que acabou de falhar.
    console.error(`Configuração inválida:\n${issues}`);
    process.exit(1);
  }

  return parsed.data;
}

export const env = loadEnv();

export const isProduction = env.NODE_ENV === 'production';
