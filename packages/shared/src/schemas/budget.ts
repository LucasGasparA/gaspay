import { z } from 'zod';
import { monthSchema, nonNegativeCentsSchema, uuidSchema } from './common.js';

export const upsertBudgetSchema = z.strictObject({
  categoryId: uuidSchema,
  /** Sempre dia 1: `2026-08-01`. */
  month: monthSchema,
  limitCents: nonNegativeCentsSchema,
});

export const listBudgetsQuerySchema = z.strictObject({
  month: monthSchema.optional(),
});

export type UpsertBudgetInput = z.infer<typeof upsertBudgetSchema>;

export interface BudgetDTO {
  id: string;
  categoryId: string;
  month: string;
  limitCents: string;
  /** Quanto já foi gasto na categoria no mês. Vem agregado do SQL. */
  spentCents: string;
  createdAt: string;
  updatedAt: string;
}
