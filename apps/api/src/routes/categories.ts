import {
  createCategorySchema,
  idParamSchema,
  listCategoriesQuerySchema,
  updateCategorySchema,
} from '@financas/shared';
import { and, asc, eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { db } from '../db/index.js';
import { categories, transactions } from '../db/schema.js';
import { assertCategoryOwned } from '../lib/ownership.js';
import { serializeCategory } from '../lib/serialize.js';
import { validate } from '../lib/validate.js';
import { currentUserId, requireSession } from '../middleware/session.js';
import type { AppEnv } from '../types.js';

export const categoryRoutes = new Hono<AppEnv>();

categoryRoutes.use('*', requireSession);

categoryRoutes.get('/', validate('query', listCategoriesQuerySchema), async (c) => {
  const userId = currentUserId(c);
  const { kind } = c.req.valid('query');

  const rows = await db
    .select()
    .from(categories)
    .where(and(eq(categories.userId, userId), kind ? eq(categories.kind, kind) : undefined))
    .orderBy(asc(categories.kind), asc(categories.name));

  return c.json({ items: rows.map(serializeCategory) });
});

categoryRoutes.post('/', validate('json', createCategorySchema), async (c) => {
  const userId = currentUserId(c);
  const input = c.req.valid('json');

  if (input.parentId) await assertCategoryOwned(db, userId, input.parentId);

  const [created] = await db
    .insert(categories)
    .values({
      userId,
      name: input.name,
      icon: input.icon,
      color: input.color,
      kind: input.kind,
      parentId: input.parentId ?? null,
    })
    .returning();

  if (!created) throw new HTTPException(500, { message: 'Não consegui criar a categoria.' });

  return c.json(serializeCategory(created), 201);
});

categoryRoutes.patch(
  '/:id',
  validate('param', idParamSchema),
  validate('json', updateCategorySchema),
  async (c) => {
    const userId = currentUserId(c);
    const { id } = c.req.valid('param');
    const input = c.req.valid('json');

    if (input.parentId) {
      if (input.parentId === id) {
        throw new HTTPException(400, { message: 'Uma categoria não pode ser pai de si mesma.' });
      }
      await assertCategoryOwned(db, userId, input.parentId);
    }

    const [updated] = await db
      .update(categories)
      .set({
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.icon !== undefined ? { icon: input.icon } : {}),
        ...(input.color !== undefined ? { color: input.color } : {}),
        ...(input.kind !== undefined ? { kind: input.kind } : {}),
        ...(input.parentId !== undefined ? { parentId: input.parentId ?? null } : {}),
      })
      .where(and(eq(categories.id, id), eq(categories.userId, userId)))
      .returning();

    if (!updated) throw new HTTPException(404, { message: 'Categoria não encontrada.' });

    return c.json(serializeCategory(updated));
  },
);

/**
 * Excluir categoria deixa os lançamentos órfãos (a FK é `set null`), o que
 * bagunça o histórico em silêncio. Se houver lançamento, exige a confirmação
 * explícita `?force=true`.
 */
categoryRoutes.delete('/:id', validate('param', idParamSchema), async (c) => {
  const userId = currentUserId(c);
  const { id } = c.req.valid('param');
  const force = c.req.query('force') === 'true';

  const [used] = await db
    .select({ id: transactions.id })
    .from(transactions)
    .where(and(eq(transactions.categoryId, id), eq(transactions.userId, userId)))
    .limit(1);

  if (used && !force) {
    throw new HTTPException(409, {
      message: 'Essa categoria tem lançamentos. Confirme com ?force=true para excluir mesmo assim.',
    });
  }

  const [deleted] = await db
    .delete(categories)
    .where(and(eq(categories.id, id), eq(categories.userId, userId)))
    .returning({ id: categories.id });

  if (!deleted) throw new HTTPException(404, { message: 'Categoria não encontrada.' });

  return c.body(null, 204);
});
