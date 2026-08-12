import { pino } from 'pino';
import { env, isProduction } from '../env.js';

/**
 * Log sem valor monetário, sem email, sem token. O redact abaixo é a rede de
 * segurança: se algum campo sensível escapar para um objeto logado, ele sai
 * como `[Redacted]` em vez de vazar para o stdout do Railway.
 */
export const logger = pino({
  level: env.LOG_LEVEL,
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'res.headers["set-cookie"]',
      '*.email',
      '*.token',
      '*.password',
      '*.accessToken',
      '*.refreshToken',
      '*.idToken',
      '*.amountCents',
      '*.limitCents',
      '*.savedCents',
      '*.balanceCents',
      '*.initialBalanceCents',
    ],
    censor: '[Redacted]',
  },
  ...(isProduction
    ? {}
    : { transport: { target: 'pino-pretty', options: { colorize: true, translateTime: 'HH:MM:ss' } } }),
});

export type Logger = typeof logger;
