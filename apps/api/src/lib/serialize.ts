import type { AccountDTO, BudgetDTO, CategoryDTO, GoalDTO, TransactionDTO } from '@dindim/shared';
import type { AccountRow, BudgetRow, CategoryRow, GoalRow, TransactionRow } from '../db/schema.js';

/**
 * `bigint` não sobrevive a `JSON.stringify` e `number` decimal é proibido.
 * Dinheiro sai da API como string de centavos: `"124050"`.
 */
export function cents(value: bigint | string | number | null | undefined): string {
  if (value === null || value === undefined) return '0';
  return BigInt(value).toString();
}

export function iso(value: Date | null): string | null {
  return value === null ? null : value.toISOString();
}

export function serializeAccount(row: AccountRow, balanceCents: bigint | string): AccountDTO {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    initialBalanceCents: cents(row.initialBalanceCents),
    balanceCents: cents(balanceCents),
    color: row.color,
    archivedAt: iso(row.archivedAt),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function serializeCategory(row: CategoryRow): CategoryDTO {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon,
    color: row.color,
    kind: row.kind,
    parentId: row.parentId,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function serializeTransaction(
  row: TransactionRow,
  accountName: string,
  category: Pick<CategoryRow, 'id' | 'name' | 'icon' | 'color' | 'kind'> | null,
): TransactionDTO {
  return {
    id: row.id,
    accountId: row.accountId,
    accountName,
    categoryId: row.categoryId,
    category: category
      ? {
          id: category.id,
          name: category.name,
          icon: category.icon,
          color: category.color,
          kind: category.kind,
        }
      : null,
    amountCents: cents(row.amountCents),
    kind: row.kind,
    occurredAt: row.occurredAt.toISOString(),
    description: row.description,
    notes: row.notes,
    recurrenceId: row.recurrenceId,
    transferGroupId: row.transferGroupId,
    transferDirection: row.transferDirection,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function serializeBudget(
  row: BudgetRow,
  category: { name: string; color: string },
  spentCents: bigint | string,
): BudgetDTO {
  return {
    id: row.id,
    categoryId: row.categoryId,
    categoryName: category.name,
    categoryColor: category.color,
    month: row.month,
    limitCents: cents(row.limitCents),
    spentCents: cents(spentCents),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function serializeGoal(row: GoalRow): GoalDTO {
  return {
    id: row.id,
    name: row.name,
    targetCents: cents(row.targetCents),
    savedCents: cents(row.savedCents),
    deadline: row.deadline,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
