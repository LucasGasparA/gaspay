import { z } from 'zod';
import { monthSchema } from './common.js';

export const categorySpendQuerySchema = z.strictObject({
  /** Sempre dia 1: `2026-08-01`. Sem default — quem decide "mês atual" é o
   * cliente, no fuso dele; o servidor não deve supor timezone. */
  month: monthSchema,
});

export interface CategorySpendItem {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  spentCents: string;
}

export interface CategorySpendDTO {
  month: string;
  totalCents: string;
  items: CategorySpendItem[];
}

export const monthlyFlowQuerySchema = z.strictObject({
  /** Mês mais recente da série — mesmo motivo do `month` acima: vem do cliente. */
  anchorMonth: monthSchema,
  months: z.coerce.number().int().min(1).max(24).default(6),
});

export interface MonthlyFlowPoint {
  month: string;
  incomeCents: string;
  expenseCents: string;
}

export interface MonthlyFlowDTO {
  points: MonthlyFlowPoint[];
}
