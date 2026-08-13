import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import { auth } from './auth.js';
import { env } from './env.js';
import { onError, onNotFound } from './middleware/error.js';
import { rateLimit } from './middleware/rate-limit.js';
import { requestContext } from './middleware/request-context.js';
import { accountRoutes } from './routes/accounts.js';
import { analyticsRoutes } from './routes/analytics.js';
import { budgetRoutes } from './routes/budgets.js';
import { categoryRoutes } from './routes/categories.js';
import { goalRoutes } from './routes/goals.js';
import { healthRoutes } from './routes/health.js';
import { meRoutes } from './routes/me.js';
import { transactionRoutes } from './routes/transactions.js';
import type { AppEnv } from './types.js';

export function createApp() {
  const app = new Hono<AppEnv>();

  app.onError(onError);
  app.notFound(onNotFound);

  app.use('*', requestContext);
  app.use('*', secureHeaders());

  /**
   * App nativo não faz preflight, mas o navegador que abre o fluxo do Google
   * faz. A lista é fechada: o deep link do app e o próprio domínio da API.
   */
  app.use(
    '*',
    cors({
      origin: [`${env.MOBILE_SCHEME}://`, env.BETTER_AUTH_URL],
      credentials: true,
      allowHeaders: ['Content-Type', 'Authorization', 'Cookie', 'x-request-id'],
      allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    }),
  );

  app.use('*', rateLimit);

  app.route('/', healthRoutes);

  // O Better Auth cuida de todo o fluxo OAuth. O client secret do Google só
  // existe aqui dentro — nunca chega ao APK.
  app.on(['GET', 'POST'], '/api/auth/*', (c) => auth.handler(c.req.raw));

  app.route('/api/me', meRoutes);
  app.route('/api/accounts', accountRoutes);
  app.route('/api/categories', categoryRoutes);
  app.route('/api/transactions', transactionRoutes);
  app.route('/api/budgets', budgetRoutes);
  app.route('/api/goals', goalRoutes);
  app.route('/api/analytics', analyticsRoutes);

  return app;
}

export type App = ReturnType<typeof createApp>;
