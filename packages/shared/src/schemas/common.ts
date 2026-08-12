import { z } from 'zod';

export const uuidSchema = z.uuid({ message: 'id inválido' });

export const hexColorSchema = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, 'cor deve ser hexadecimal de 6 dígitos');

/**
 * Dinheiro no JSON é **string de centavos** (`"124050"`), nunca número decimal.
 * `bigint` não sobrevive a `JSON.stringify`, e `number` decimal é proibido pelo
 * plano. Aceitamos `number` só se for inteiro, para não quebrar um curl manual.
 */
export const centsSchema = z
  .union([
    z.string().regex(/^-?\d{1,15}$/, 'valor deve ser um inteiro em centavos'),
    z.number().int('valor deve ser um inteiro em centavos'),
  ])
  .transform((value) => BigInt(value));

export const positiveCentsSchema = centsSchema.refine(
  (value) => value > 0n,
  'valor deve ser maior que zero',
);

export const nonNegativeCentsSchema = centsSchema.refine(
  (value) => value >= 0n,
  'valor não pode ser negativo',
);

/** ISO 8601 com offset, vindo do cliente. */
export const instantSchema = z.iso.datetime({ offset: true }).transform((value) => new Date(value));

/** `YYYY-MM-DD` puro, sem fuso. */
export const dateOnlySchema = z.iso.date();

/** `budgets.month` é sempre dia 1. */
export const monthSchema = dateOnlySchema.refine(
  (value) => value.endsWith('-01'),
  'mês deve ser o primeiro dia do mês (YYYY-MM-01)',
);

export const idParamSchema = z.strictObject({ id: uuidSchema });

/** Paginação por cursor. Offset fica lento e pula linhas quando há escrita. */
export const cursorPaginationSchema = z.strictObject({
  limit: z.coerce.number().int().min(1).max(100).optional(),
  cursor: z.string().min(1).optional(),
});

export type CursorPagination = z.infer<typeof cursorPaginationSchema>;

export interface Page<T> {
  items: T[];
  nextCursor: string | null;
}
