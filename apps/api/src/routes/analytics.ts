import {
  categorySpendQuerySchema,
  monthlyFlowQuerySchema,
  type CategorySpendDTO,
  type MonthlyFlowDTO,
} from '@dindim/shared';
import { and, eq, sql } from 'drizzle-orm';
import { Hono } from 'hono';
import { db } from '../db/index.js';
import { categories, transactions } from '../db/schema.js';
import { validate } from '../lib/validate.js';
import { currentUserId, requireSession } from '../middleware/session.js';
import type { AppEnv } from '../types.js';

export const analyticsRoutes = new Hono<AppEnv>();

analyticsRoutes.use('*', requireSession);

/** Quanto foi gasto em cada categoria no mês — base do donut de Categorias. */
analyticsRoutes.get('/category-spend', validate('query', categorySpendQuerySchema), async (c) => {
  const userId = currentUserId(c);
  const { month } = c.req.valid('query');

  const rows = await db
    .select({
      categoryId: categories.id,
      categoryName: categories.name,
      categoryColor: categories.color,
      spentCents: sql<string>`coalesce(sum(${transactions.amountCents}), 0)::text`,
    })
    .from(transactions)
    .innerJoin(categories, eq(categories.id, transactions.categoryId))
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.kind, 'expense'),
        sql`${transactions.occurredAt} >= ${month}::date`,
        sql`${transactions.occurredAt} < (${month}::date + interval '1 month')`,
      ),
    )
    .groupBy(categories.id, categories.name, categories.color)
    .orderBy(sql`sum(${transactions.amountCents}) desc`);

  const totalCents = rows.reduce((sum, row) => sum + BigInt(row.spentCents), 0n);

  return c.json<CategorySpendDTO>({ month, totalCents: totalCents.toString(), items: rows });
});

/** Entradas/saídas por mês nos últimos N meses — base do gráfico da Home. */
analyticsRoutes.get('/monthly-flow', validate('query', monthlyFlowQuerySchema), async (c) => {
  const userId = currentUserId(c);
  const { anchorMonth, months } = c.req.valid('query');

  const rows = await db
    .select({
      month: sql<string>`to_char(date_trunc('month', ${transactions.occurredAt}), 'YYYY-MM-DD')`,
      incomeCents: sql<string>`coalesce(sum(${transactions.amountCents}) filter (where ${transactions.kind} = 'income'), 0)::text`,
      expenseCents: sql<string>`coalesce(sum(${transactions.amountCents}) filter (where ${transactions.kind} = 'expense'), 0)::text`,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        sql`${transactions.occurredAt} >= (${anchorMonth}::date - (interval '1 month' * ${months - 1}))`,
        sql`${transactions.occurredAt} < (${anchorMonth}::date + interval '1 month')`,
      ),
    )
    .groupBy(sql`date_trunc('month', ${transactions.occurredAt})`)
    .orderBy(sql`date_trunc('month', ${transactions.occurredAt})`);

  // Meses sem nenhum lançamento não aparecem na query acima — o cliente
  // completa os buracos com zero (ver hooks/use-analytics.ts no mobile).
  return c.json<MonthlyFlowDTO>({ points: rows });
});
