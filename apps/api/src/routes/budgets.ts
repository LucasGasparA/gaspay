import { idParamSchema, listBudgetsQuerySchema, upsertBudgetSchema } from '@dindim/shared';
import { and, eq, getTableColumns, sql } from 'drizzle-orm';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { db } from '../db/index.js';
import { budgets, categories, transactions } from '../db/schema.js';
import { assertCategoryOwned } from '../lib/ownership.js';
import { serializeBudget } from '../lib/serialize.js';
import { validate } from '../lib/validate.js';
import { currentUserId, requireSession } from '../middleware/session.js';
import type { AppEnv } from '../types.js';

export const budgetRoutes = new Hono<AppEnv>();

budgetRoutes.use('*', requireSession);

/**
 * Gasto da categoria no mês do orçamento, agregado em SQL. `month` é sempre
 * dia 1 — o intervalo é [month, month + 1 mês). O filtro de data mora dentro
 * do `filter` do agregado, não no JOIN, senão um orçamento sem nenhum
 * lançamento no mês desapareceria da lista (LEFT JOIN viraria INNER na prática).
 */
const spentCentsExpr = sql<string>`(
  coalesce(sum(${transactions.amountCents}) filter (
    where ${transactions.kind} = 'expense'
      and ${transactions.occurredAt} >= ${budgets.month}
      and ${transactions.occurredAt} < (${budgets.month}::date + interval '1 month')
  ), 0)
)::text`;

function listSelection(where: ReturnType<typeof and>) {
  return db
    .select({
      ...getTableColumns(budgets),
      categoryName: categories.name,
      categoryColor: categories.color,
      spentCents: spentCentsExpr,
    })
    .from(budgets)
    .innerJoin(categories, eq(categories.id, budgets.categoryId))
    .leftJoin(
      transactions,
      and(eq(transactions.categoryId, budgets.categoryId), eq(transactions.userId, budgets.userId)),
    )
    .where(where)
    .groupBy(budgets.id, categories.name, categories.color);
}

function toDTO(row: Awaited<ReturnType<typeof listSelection>>[number]) {
  return serializeBudget(row, { name: row.categoryName, color: row.categoryColor }, row.spentCents);
}

budgetRoutes.get('/', validate('query', listBudgetsQuerySchema), async (c) => {
  const userId = currentUserId(c);
  const { month } = c.req.valid('query');

  const rows = await listSelection(
    and(eq(budgets.userId, userId), month ? eq(budgets.month, month) : undefined),
  ).orderBy(budgets.month);

  return c.json({ items: rows.map(toDTO) });
});

/**
 * Cria ou atualiza o orçamento da categoria no mês — `(userId, categoryId,
 * month)` é único, então isso é sempre um upsert, nunca duplica linha.
 */
budgetRoutes.post('/', validate('json', upsertBudgetSchema), async (c) => {
  const userId = currentUserId(c);
  const input = c.req.valid('json');

  await assertCategoryOwned(db, userId, input.categoryId);

  const [created] = await db
    .insert(budgets)
    .values({ userId, categoryId: input.categoryId, month: input.month, limitCents: input.limitCents })
    .onConflictDoUpdate({
      target: [budgets.userId, budgets.categoryId, budgets.month],
      set: { limitCents: input.limitCents },
    })
    .returning({ id: budgets.id });

  if (!created) throw new HTTPException(500, { message: 'Não consegui salvar o orçamento.' });

  const [row] = await listSelection(and(eq(budgets.userId, userId), eq(budgets.id, created.id)));

  if (!row) throw new HTTPException(500, { message: 'Não consegui salvar o orçamento.' });

  return c.json(toDTO(row), 201);
});

budgetRoutes.delete('/:id', validate('param', idParamSchema), async (c) => {
  const userId = currentUserId(c);
  const { id } = c.req.valid('param');

  const [deleted] = await db
    .delete(budgets)
    .where(and(eq(budgets.id, id), eq(budgets.userId, userId)))
    .returning({ id: budgets.id });

  if (!deleted) throw new HTTPException(404, { message: 'Orçamento não encontrado.' });

  return c.body(null, 204);
});
