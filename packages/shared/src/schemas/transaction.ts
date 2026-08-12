import { z } from 'zod';
import {
  cursorPaginationSchema,
  instantSchema,
  positiveCentsSchema,
  uuidSchema,
} from './common.js';
import type { CategoryDTO } from './category.js';

export const transactionKinds = ['expense', 'income', 'transfer'] as const;
export const transactionKindSchema = z.enum(transactionKinds);
export type TransactionKind = z.infer<typeof transactionKindSchema>;

/** Transferência tem endpoint próprio — cria duas linhas ligadas. */
export const entryKindSchema = z.enum(['expense', 'income']);

export const createTransactionSchema = z.strictObject({
  accountId: uuidSchema,
  categoryId: uuidSchema.nullish(),
  /** Sempre positivo. O sinal vem do `kind`. */
  amountCents: positiveCentsSchema,
  kind: entryKindSchema,
  occurredAt: instantSchema,
  description: z.string().trim().min(1, 'descreva o lançamento').max(120),
  notes: z.string().trim().max(500).nullish(),
});

export const updateTransactionSchema = z.strictObject({
  accountId: uuidSchema.optional(),
  categoryId: uuidSchema.nullish(),
  amountCents: positiveCentsSchema.optional(),
  kind: entryKindSchema.optional(),
  occurredAt: instantSchema.optional(),
  description: z.string().trim().min(1).max(120).optional(),
  notes: z.string().trim().max(500).nullish(),
});

export const createTransferSchema = z
  .strictObject({
    fromAccountId: uuidSchema,
    toAccountId: uuidSchema,
    amountCents: positiveCentsSchema,
    occurredAt: instantSchema,
    description: z.string().trim().min(1).max(120),
    notes: z.string().trim().max(500).nullish(),
  })
  .refine((value) => value.fromAccountId !== value.toAccountId, {
    message: 'origem e destino devem ser contas diferentes',
    path: ['toAccountId'],
  });

export const listTransactionsQuerySchema = cursorPaginationSchema.extend({
  accountId: uuidSchema.optional(),
  categoryId: uuidSchema.optional(),
  kind: transactionKindSchema.optional(),
  /** ISO 8601; filtra `occurredAt >= from`. */
  from: z.iso.datetime({ offset: true }).optional(),
  /** ISO 8601; filtra `occurredAt <= to`. */
  to: z.iso.datetime({ offset: true }).optional(),
  search: z.string().trim().min(1).max(80).optional(),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type CreateTransferInput = z.infer<typeof createTransferSchema>;
export type ListTransactionsQuery = z.infer<typeof listTransactionsQuerySchema>;

export interface TransactionDTO {
  id: string;
  accountId: string;
  accountName: string;
  categoryId: string | null;
  category: Pick<CategoryDTO, 'id' | 'name' | 'icon' | 'color' | 'kind'> | null;
  amountCents: string;
  kind: TransactionKind;
  occurredAt: string;
  description: string;
  notes: string | null;
  recurrenceId: string | null;
  /** Liga as duas pernas de uma transferência. `null` no resto. */
  transferGroupId: string | null;
  /** `out` na conta de origem, `in` na de destino. `null` no resto. */
  transferDirection: 'out' | 'in' | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Transferência move saldo entre contas: não é gasto nem receita e não pode
 * entrar em totais do mês nem em orçamento.
 */
export function isTransfer(transaction: Pick<TransactionDTO, 'kind'>): boolean {
  return transaction.kind === 'transfer';
}

/** Quanto esta transação move no saldo da conta em que está, já com sinal. */
export function transactionSignedCents(
  transaction: Pick<TransactionDTO, 'kind' | 'amountCents' | 'transferDirection'>,
): bigint {
  const amount = BigInt(transaction.amountCents);
  if (transaction.kind === 'income') return amount;
  if (transaction.kind === 'expense') return -amount;
  return transaction.transferDirection === 'in' ? amount : -amount;
}
