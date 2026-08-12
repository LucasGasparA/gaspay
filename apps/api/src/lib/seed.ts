import { defaultCategories } from '@financas/shared';
import { eq, sql } from 'drizzle-orm';
import type { Database } from '../db/index.js';
import { categories } from '../db/schema.js';

/**
 * Semeia as categorias padrão. Idempotente: se o usuário já tem categoria,
 * não faz nada. É chamado no `after` do hook de criação de usuário e de novo
 * no `/me`, porque uma falha de seed no cadastro deixaria o app sem categoria
 * nenhuma e sem forma de se recuperar.
 */
export async function ensureDefaultCategories(db: Database, userId: string): Promise<number> {
  const [existing] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(categories)
    .where(eq(categories.userId, userId));

  if ((existing?.count ?? 0) > 0) return 0;

  const inserted = await db
    .insert(categories)
    .values(
      defaultCategories.map((category) => ({
        userId,
        name: category.name,
        icon: category.icon,
        color: category.color,
        kind: category.kind,
      })),
    )
    .returning({ id: categories.id });

  return inserted.length;
}
