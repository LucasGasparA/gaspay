import { createGoalSchema, idParamSchema, updateGoalSchema } from '@dindim/shared';
import { and, eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { db } from '../db/index.js';
import { goals } from '../db/schema.js';
import { serializeGoal } from '../lib/serialize.js';
import { validate } from '../lib/validate.js';
import { currentUserId, requireSession } from '../middleware/session.js';
import type { AppEnv } from '../types.js';

export const goalRoutes = new Hono<AppEnv>();

goalRoutes.use('*', requireSession);

goalRoutes.get('/', async (c) => {
  const userId = currentUserId(c);
  const rows = await db.select().from(goals).where(eq(goals.userId, userId)).orderBy(goals.createdAt);
  return c.json({ items: rows.map(serializeGoal) });
});

goalRoutes.post('/', validate('json', createGoalSchema), async (c) => {
  const userId = currentUserId(c);
  const input = c.req.valid('json');

  const [created] = await db
    .insert(goals)
    .values({
      userId,
      name: input.name,
      targetCents: input.targetCents,
      savedCents: input.savedCents ?? 0n,
      deadline: input.deadline ?? null,
    })
    .returning();

  if (!created) throw new HTTPException(500, { message: 'Não consegui criar a meta.' });

  return c.json(serializeGoal(created), 201);
});

goalRoutes.patch(
  '/:id',
  validate('param', idParamSchema),
  validate('json', updateGoalSchema),
  async (c) => {
    const userId = currentUserId(c);
    const { id } = c.req.valid('param');
    const input = c.req.valid('json');

    const [updated] = await db
      .update(goals)
      .set({
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.targetCents !== undefined ? { targetCents: input.targetCents } : {}),
        ...(input.savedCents !== undefined ? { savedCents: input.savedCents } : {}),
        ...(input.deadline !== undefined ? { deadline: input.deadline ?? null } : {}),
      })
      .where(and(eq(goals.id, id), eq(goals.userId, userId)))
      .returning();

    if (!updated) throw new HTTPException(404, { message: 'Meta não encontrada.' });

    return c.json(serializeGoal(updated));
  },
);

goalRoutes.delete('/:id', validate('param', idParamSchema), async (c) => {
  const userId = currentUserId(c);
  const { id } = c.req.valid('param');

  const [deleted] = await db
    .delete(goals)
    .where(and(eq(goals.id, id), eq(goals.userId, userId)))
    .returning({ id: goals.id });

  if (!deleted) throw new HTTPException(404, { message: 'Meta não encontrada.' });

  return c.body(null, 204);
});
