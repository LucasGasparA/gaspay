import {
  createTransactionSchema,
  createTransferSchema,
  idParamSchema,
  listTransactionsQuerySchema,
  updateTransactionSchema,
  type TransactionDTO,
} from '@financas/shared';
import { and, desc, eq, getTableColumns, gte, ilike, lt, lte, or, sql } from 'drizzle-orm';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { db } from '../db/index.js';
import { accounts, categories, transactions } from '../db/schema.js';
import { assertAccountOwned } from '../lib/ownership.js';
import { serializeTransaction } from '../lib/serialize.js';
import { validate } from '../lib/validate.js';
import { currentUserId, requireSession } from '../middleware/session.js';
import type { AppEnv } from '../types.js';

export const transactionRoutes = new Hono<AppEnv>();

transactionRoutes.use('*', requireSession);

const DEFAULT_LIMIT = 30;

/**
 * Cursor de keyset: `occurredAt|id`.
 *
 * Offset pula e repete linhas quando algo é inserido no meio da paginação — e
 * neste app quase toda inserção cai no topo da lista, que é exatamente onde o
 * offset erra.
 */
function encodeCursor(occurredAt: Date, id: string): string {
  return Buffer.from(`${occurredAt.toISOString()}|${id}`, 'utf8').toString('base64url');
}

function decodeCursor(cursor: string): { occurredAt: Date; id: string } {
  const [iso, id] = Buffer.from(cursor, 'base64url').toString('utf8').split('|');
  const occurredAt = iso ? new Date(iso) : new Date(Number.NaN);

  if (!id || Number.isNaN(occurredAt.getTime())) {
    throw new HTTPException(400, { message: 'Cursor inválido.' });
  }

  return { occurredAt, id };
}

/** Categoria de despesa não pode etiquetar uma receita, e vice-versa. */
async function assertCategoryMatchesKind(
  userId: string,
  categoryId: string,
  kind: 'expense' | 'income',
): Promise<void> {
  const [category] = await db
    .select({ kind: categories.kind })
    .from(categories)
    .where(and(eq(categories.id, categoryId), eq(categories.userId, userId)))
    .limit(1);

  if (!category) throw new HTTPException(404, { message: 'Categoria não encontrada.' });

  if (category.kind !== kind) {
    throw new HTTPException(400, {
      message:
        kind === 'expense'
          ? 'Essa categoria é de entrada — escolha uma de saída.'
          : 'Essa categoria é de saída — escolha uma de entrada.',
    });
  }
}

const listSelection = {
  ...getTableColumns(transactions),
  accountName: accounts.name,
  categoryName: categories.name,
  categoryIcon: categories.icon,
  categoryColor: categories.color,
  categoryKind: categories.kind,
};

function toDTO(row: Awaited<ReturnType<typeof listTransactions>>[number]): TransactionDTO {
  return serializeTransaction(
    row,
    row.accountName,
    row.categoryId && row.categoryName && row.categoryIcon && row.categoryColor && row.categoryKind
      ? {
          id: row.categoryId,
          name: row.categoryName,
          icon: row.categoryIcon,
          color: row.categoryColor,
          kind: row.categoryKind,
        }
      : null,
  );
}

function listTransactions(where: ReturnType<typeof and>, limit: number) {
  return db
    .select(listSelection)
    .from(transactions)
    .innerJoin(accounts, eq(accounts.id, transactions.accountId))
    .leftJoin(categories, eq(categories.id, transactions.categoryId))
    .where(where)
    .orderBy(desc(transactions.occurredAt), desc(transactions.id))
    .limit(limit);
}

transactionRoutes.get('/', validate('query', listTransactionsQuerySchema), async (c) => {
  const userId = currentUserId(c);
  const query = c.req.valid('query');
  const limit = query.limit ?? DEFAULT_LIMIT;

  const cursor = query.cursor ? decodeCursor(query.cursor) : null;

  const where = and(
    eq(transactions.userId, userId),
    query.accountId ? eq(transactions.accountId, query.accountId) : undefined,
    query.categoryId ? eq(transactions.categoryId, query.categoryId) : undefined,
    query.kind ? eq(transactions.kind, query.kind) : undefined,
    query.from ? gte(transactions.occurredAt, new Date(query.from)) : undefined,
    query.to ? lte(transactions.occurredAt, new Date(query.to)) : undefined,
    query.search ? ilike(transactions.description, `%${query.search}%`) : undefined,
    cursor
      ? or(
          lt(transactions.occurredAt, cursor.occurredAt),
          and(eq(transactions.occurredAt, cursor.occurredAt), lt(transactions.id, cursor.id)),
        )
      : undefined,
  );

  // Pede um a mais que o limite para saber se existe página seguinte sem
  // precisar de um count().
  const rows = await listTransactions(where, limit + 1);
  const hasMore = rows.length > limit;
  const page = hasMore ? rows.slice(0, limit) : rows;
  const last = page.at(-1);

  return c.json({
    items: page.map(toDTO),
    nextCursor: hasMore && last ? encodeCursor(last.occurredAt, last.id) : null,
  });
});

transactionRoutes.get('/:id', validate('param', idParamSchema), async (c) => {
  const userId = currentUserId(c);
  const { id } = c.req.valid('param');

  const [row] = await listTransactions(
    and(eq(transactions.userId, userId), eq(transactions.id, id)),
    1,
  );

  if (!row) throw new HTTPException(404, { message: 'Lançamento não encontrado.' });

  return c.json(toDTO(row));
});

transactionRoutes.post('/', validate('json', createTransactionSchema), async (c) => {
  const userId = currentUserId(c);
  const input = c.req.valid('json');

  await assertAccountOwned(db, userId, input.accountId);
  if (input.categoryId) await assertCategoryMatchesKind(userId, input.categoryId, input.kind);

  const [created] = await db
    .insert(transactions)
    .values({
      userId,
      accountId: input.accountId,
      categoryId: input.categoryId ?? null,
      amountCents: input.amountCents,
      kind: input.kind,
      occurredAt: input.occurredAt,
      description: input.description,
      notes: input.notes ?? null,
    })
    .returning({ id: transactions.id });

  if (!created) throw new HTTPException(500, { message: 'Não consegui salvar o lançamento.' });

  const [row] = await listTransactions(
    and(eq(transactions.userId, userId), eq(transactions.id, created.id)),
    1,
  );

  if (!row) throw new HTTPException(500, { message: 'Não consegui salvar o lançamento.' });

  return c.json(toDTO(row), 201);
});

transactionRoutes.patch(
  '/:id',
  validate('param', idParamSchema),
  validate('json', updateTransactionSchema),
  async (c) => {
    const userId = currentUserId(c);
    const { id } = c.req.valid('param');
    const input = c.req.valid('json');

    const [existing] = await db
      .select({ kind: transactions.kind, transferGroupId: transactions.transferGroupId })
      .from(transactions)
      .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
      .limit(1);

    if (!existing) throw new HTTPException(404, { message: 'Lançamento não encontrado.' });

    if (existing.transferGroupId) {
      throw new HTTPException(409, {
        message: 'Transferência não se edita: exclua e lance de novo.',
      });
    }

    if (input.accountId) await assertAccountOwned(db, userId, input.accountId);

    if (input.categoryId) {
      const kind = input.kind ?? (existing.kind as 'expense' | 'income');
      await assertCategoryMatchesKind(userId, input.categoryId, kind);
    }

    const [updated] = await db
      .update(transactions)
      .set({
        ...(input.accountId !== undefined ? { accountId: input.accountId } : {}),
        ...(input.categoryId !== undefined ? { categoryId: input.categoryId ?? null } : {}),
        ...(input.amountCents !== undefined ? { amountCents: input.amountCents } : {}),
        ...(input.kind !== undefined ? { kind: input.kind } : {}),
        ...(input.occurredAt !== undefined ? { occurredAt: input.occurredAt } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.notes !== undefined ? { notes: input.notes ?? null } : {}),
      })
      .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
      .returning({ id: transactions.id });

    if (!updated) throw new HTTPException(404, { message: 'Lançamento não encontrado.' });

    const [row] = await listTransactions(
      and(eq(transactions.userId, userId), eq(transactions.id, id)),
      1,
    );

    if (!row) throw new HTTPException(404, { message: 'Lançamento não encontrado.' });

    return c.json(toDTO(row));
  },
);

/** Apagar uma perna de transferência apaga a outra: meia transferência não existe. */
transactionRoutes.delete('/:id', validate('param', idParamSchema), async (c) => {
  const userId = currentUserId(c);
  const { id } = c.req.valid('param');

  const [existing] = await db
    .select({ transferGroupId: transactions.transferGroupId })
    .from(transactions)
    .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
    .limit(1);

  if (!existing) throw new HTTPException(404, { message: 'Lançamento não encontrado.' });

  await db
    .delete(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        existing.transferGroupId
          ? eq(transactions.transferGroupId, existing.transferGroupId)
          : eq(transactions.id, id),
      ),
    );

  return c.body(null, 204);
});

/**
 * Transferência entre contas: duas linhas `kind='transfer'` ligadas por
 * `transferGroupId`. Uma sai da origem, outra entra no destino, e nenhuma delas
 * conta como despesa ou receita no mês — só move saldo entre contas.
 *
 * As duas nascem na mesma transação de banco: uma perna sozinha desequilibraria
 * o saldo total em silêncio.
 */
transactionRoutes.post('/transfer', validate('json', createTransferSchema), async (c) => {
  const userId = currentUserId(c);
  const input = c.req.valid('json');

  await assertAccountOwned(db, userId, input.fromAccountId);
  await assertAccountOwned(db, userId, input.toAccountId);

  const transferGroupId = crypto.randomUUID();

  const created = await db.transaction(async (tx) =>
    tx
      .insert(transactions)
      .values([
        {
          userId,
          accountId: input.fromAccountId,
          amountCents: input.amountCents,
          kind: 'transfer' as const,
          transferDirection: 'out' as const,
          occurredAt: input.occurredAt,
          description: input.description,
          notes: input.notes ?? null,
          transferGroupId,
        },
        {
          userId,
          accountId: input.toAccountId,
          amountCents: input.amountCents,
          kind: 'transfer' as const,
          transferDirection: 'in' as const,
          occurredAt: input.occurredAt,
          description: input.description,
          notes: input.notes ?? null,
          transferGroupId,
        },
      ])
      .returning({ id: transactions.id }),
  );

  const rows = await listTransactions(
    and(eq(transactions.userId, userId), eq(transactions.transferGroupId, transferGroupId)),
    created.length,
  );

  return c.json({ transferGroupId, items: rows.map(toDTO) }, 201);
});
