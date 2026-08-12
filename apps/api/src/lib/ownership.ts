import { and, eq } from 'drizzle-orm';
import { HTTPException } from 'hono/http-exception';
import type { Database } from '../db/index.js';
import { accounts, categories } from '../db/schema.js';

/**
 * Existe uma conta/categoria com esse id **que pertence a este usuário**?
 *
 * Devolve 404 e não 403 de propósito: um 403 confirmaria que o id existe para
 * outra pessoa. Como o app tem um usuário só isso é quase teórico, mas é o
 * comportamento certo e custa uma linha.
 */
export async function assertAccountOwned(
  db: Database,
  userId: string,
  accountId: string,
): Promise<void> {
  const [row] = await db
    .select({ id: accounts.id })
    .from(accounts)
    .where(and(eq(accounts.id, accountId), eq(accounts.userId, userId)))
    .limit(1);

  if (!row) throw new HTTPException(404, { message: 'Conta não encontrada.' });
}

export async function assertCategoryOwned(
  db: Database,
  userId: string,
  categoryId: string,
): Promise<void> {
  const [row] = await db
    .select({ id: categories.id })
    .from(categories)
    .where(and(eq(categories.id, categoryId), eq(categories.userId, userId)))
    .limit(1);

  if (!row) throw new HTTPException(404, { message: 'Categoria não encontrada.' });
}
