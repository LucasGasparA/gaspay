import {
  createAccountSchema,
  idParamSchema,
  listAccountsQuerySchema,
  updateAccountSchema,
} from '@financas/shared';
import { and, asc, eq, getTableColumns, isNull, sql } from 'drizzle-orm';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { db } from '../db/index.js';
import { accounts, transactions } from '../db/schema.js';
import { serializeAccount } from '../lib/serialize.js';
import { validate } from '../lib/validate.js';
import { currentUserId, requireSession } from '../middleware/session.js';
import type { AppEnv } from '../types.js';

export const accountRoutes = new Hono<AppEnv>();

accountRoutes.use('*', requireSession);

/**
 * Saldo = saldo inicial + entradas − saídas, agregado no Postgres.
 *
 * Nunca trazer as transações para o cliente somar: com alguns milhares de
 * linhas isso vira segundos de rede e de JSON parse no aparelho.
 *
 * O `::text` no fim força o driver a devolver string em vez de number — o
 * `sum()` de `int8` vira `numeric`, e `numeric` grande não cabe em `number`.
 */
const balanceCentsExpr = sql<string>`(
  ${accounts.initialBalanceCents}
  + coalesce(sum(${transactions.amountCents}) filter (
      where ${transactions.kind} = 'income' or ${transactions.transferDirection} = 'in'
    ), 0)
  - coalesce(sum(${transactions.amountCents}) filter (
      where ${transactions.kind} = 'expense' or ${transactions.transferDirection} = 'out'
    ), 0)
)::text`;

accountRoutes.get('/', validate('query', listAccountsQuerySchema), async (c) => {
  const userId = currentUserId(c);
  const { includeArchived } = c.req.valid('query');

  const rows = await db
    .select({ ...getTableColumns(accounts), balanceCents: balanceCentsExpr })
    .from(accounts)
    .leftJoin(
      transactions,
      // O `userId` também entra no join: um índice a mais e uma garantia a mais
      // de que nenhuma linha de outro usuário encosta no somatório.
      and(eq(transactions.accountId, accounts.id), eq(transactions.userId, userId)),
    )
    .where(
      and(
        eq(accounts.userId, userId),
        includeArchived === true ? undefined : isNull(accounts.archivedAt),
      ),
    )
    .groupBy(accounts.id)
    .orderBy(asc(accounts.archivedAt), asc(accounts.name));

  return c.json({
    items: rows.map((row) => serializeAccount(row, row.balanceCents)),
  });
});

accountRoutes.post('/', validate('json', createAccountSchema), async (c) => {
  const userId = currentUserId(c);
  const input = c.req.valid('json');

  const [created] = await db
    .insert(accounts)
    .values({
      userId,
      name: input.name,
      type: input.type,
      initialBalanceCents: input.initialBalanceCents ?? 0n,
      color: input.color ?? null,
    })
    .returning();

  if (!created) throw new HTTPException(500, { message: 'Não consegui criar a conta.' });

  return c.json(serializeAccount(created, created.initialBalanceCents), 201);
});

accountRoutes.patch(
  '/:id',
  validate('param', idParamSchema),
  validate('json', updateAccountSchema),
  async (c) => {
    const userId = currentUserId(c);
    const { id } = c.req.valid('param');
    const input = c.req.valid('json');

    const [updated] = await db
      .update(accounts)
      .set({
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.type !== undefined ? { type: input.type } : {}),
        ...(input.initialBalanceCents !== undefined
          ? { initialBalanceCents: input.initialBalanceCents }
          : {}),
        ...(input.color !== undefined ? { color: input.color ?? null } : {}),
        ...(input.archived !== undefined ? { archivedAt: input.archived ? new Date() : null } : {}),
      })
      .where(and(eq(accounts.id, id), eq(accounts.userId, userId)))
      .returning();

    if (!updated) throw new HTTPException(404, { message: 'Conta não encontrada.' });

    const [balance] = await db
      .select({ balanceCents: balanceCentsExpr })
      .from(accounts)
      .leftJoin(
        transactions,
        and(eq(transactions.accountId, accounts.id), eq(transactions.userId, userId)),
      )
      .where(and(eq(accounts.id, id), eq(accounts.userId, userId)))
      .groupBy(accounts.id);

    return c.json(serializeAccount(updated, balance?.balanceCents ?? updated.initialBalanceCents));
  },
);

/**
 * Só apaga conta vazia. Com histórico, a conta é arquivada — apagar levaria
 * junto lançamentos que já entraram em saldo e em relatório de meses fechados.
 */
accountRoutes.delete('/:id', validate('param', idParamSchema), async (c) => {
  const userId = currentUserId(c);
  const { id } = c.req.valid('param');

  const [used] = await db
    .select({ id: transactions.id })
    .from(transactions)
    .where(and(eq(transactions.accountId, id), eq(transactions.userId, userId)))
    .limit(1);

  if (used) {
    throw new HTTPException(409, {
      message: 'Essa conta tem lançamentos. Arquive em vez de excluir.',
    });
  }

  const [deleted] = await db
    .delete(accounts)
    .where(and(eq(accounts.id, id), eq(accounts.userId, userId)))
    .returning({ id: accounts.id });

  if (!deleted) throw new HTTPException(404, { message: 'Conta não encontrada.' });

  return c.body(null, 204);
});
