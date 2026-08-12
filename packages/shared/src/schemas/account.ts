import { z } from 'zod';
import { centsSchema, hexColorSchema } from './common.js';

export const accountTypes = ['checking', 'savings', 'credit_card', 'cash', 'investment'] as const;
export const accountTypeSchema = z.enum(accountTypes);
export type AccountType = z.infer<typeof accountTypeSchema>;

export const accountTypeLabels: Record<AccountType, string> = {
  checking: 'Conta corrente',
  savings: 'Poupança',
  credit_card: 'Cartão de crédito',
  cash: 'Dinheiro',
  investment: 'Investimento',
};

export const createAccountSchema = z.strictObject({
  name: z.string().trim().min(1, 'dê um nome à conta').max(60),
  type: accountTypeSchema,
  // Cartão de crédito começa negativo com frequência, então aceita sinal.
  initialBalanceCents: centsSchema.optional(),
  color: hexColorSchema.nullish(),
});

export const updateAccountSchema = z.strictObject({
  name: z.string().trim().min(1).max(60).optional(),
  type: accountTypeSchema.optional(),
  initialBalanceCents: centsSchema.optional(),
  color: hexColorSchema.nullish(),
  /** `true` arquiva, `false` desarquiva. Conta nunca é apagada de verdade. */
  archived: z.boolean().optional(),
});

export const listAccountsQuerySchema = z.strictObject({
  includeArchived: z.stringbool().optional(),
});

export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;

/** Como a conta sai da API: dinheiro em string de centavos. */
export interface AccountDTO {
  id: string;
  name: string;
  type: AccountType;
  initialBalanceCents: string;
  /** `initialBalanceCents` + entradas − saídas. Calculado em SQL. */
  balanceCents: string;
  color: string | null;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
