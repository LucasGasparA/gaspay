import { relations, sql } from 'drizzle-orm';
import {
  bigint,
  boolean,
  check,
  date,
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  type AnyPgColumn,
} from 'drizzle-orm/pg-core';
import { user } from './auth-schema.js';

export * from './auth-schema.js';

/**
 * Dinheiro é `bigint` em centavos, com `mode: 'bigint'` para o driver devolver
 * `bigint` do JS e não `string`. Nenhuma coluna monetária é `numeric` ou `real`.
 */
const cents = (name: string) => bigint(name, { mode: 'bigint' });

const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
};

const ownerId = () =>
  uuid('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' });

export const accountTypeEnum = pgEnum('account_type', [
  'checking',
  'savings',
  'credit_card',
  'cash',
  'investment',
]);

export const categoryKindEnum = pgEnum('category_kind', ['expense', 'income']);

export const transactionKindEnum = pgEnum('transaction_kind', ['expense', 'income', 'transfer']);

/**
 * As duas pernas de uma transferência têm `kind='transfer'` e `amountCents`
 * positivo, então nada nelas diz qual sai e qual entra. Esta coluna diz.
 * É `null` em tudo que não é transferência.
 */
export const transferDirectionEnum = pgEnum('transfer_direction', ['out', 'in']);

export const accounts = pgTable(
  'accounts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: ownerId(),
    name: text('name').notNull(),
    type: accountTypeEnum('type').notNull(),
    // `.default(sql\`0\`)` em vez de `.default(0n)`: drizzle-kit não sabe
    // serializar BigInt no snapshot e quebra o `generate` com um `0n` literal.
    initialBalanceCents: cents('initial_balance_cents').notNull().default(sql`0`),
    color: text('color'),
    /** Conta nunca é apagada de verdade: arquivar preserva o histórico. */
    archivedAt: timestamp('archived_at', { withTimezone: true }),
    ...timestamps,
  },
  (table) => [index('accounts_user_idx').on(table.userId)],
);

export const categories = pgTable(
  'categories',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: ownerId(),
    name: text('name').notNull(),
    /** Nome do ícone lucide. */
    icon: text('icon').notNull(),
    color: text('color').notNull(),
    kind: categoryKindEnum('kind').notNull(),
    parentId: uuid('parent_id').references((): AnyPgColumn => categories.id, {
      onDelete: 'set null',
    }),
    ...timestamps,
  },
  (table) => [index('categories_user_kind_idx').on(table.userId, table.kind)],
);

export const recurrences = pgTable(
  'recurrences',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: ownerId(),
    /** Molde da transação a ser criada, no formato de `createTransactionSchema`. */
    template: jsonb('template').notNull(),
    /** RRULE (RFC 5545). */
    rule: text('rule').notNull(),
    nextRunAt: timestamp('next_run_at', { withTimezone: true }).notNull(),
    active: boolean('active').notNull().default(true),
    ...timestamps,
  },
  (table) => [index('recurrences_due_idx').on(table.active, table.nextRunAt)],
);

export const transactions = pgTable(
  'transactions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: ownerId(),
    accountId: uuid('account_id')
      .notNull()
      .references(() => accounts.id, { onDelete: 'restrict' }),
    categoryId: uuid('category_id').references(() => categories.id, { onDelete: 'set null' }),
    /** Sempre positivo. O sinal vem de `kind`. */
    amountCents: cents('amount_cents').notNull(),
    kind: transactionKindEnum('kind').notNull(),
    occurredAt: timestamp('occurred_at', { withTimezone: true }).notNull(),
    description: text('description').notNull(),
    notes: text('notes'),
    recurrenceId: uuid('recurrence_id').references(() => recurrences.id, { onDelete: 'set null' }),
    /** Liga as duas pernas de uma transferência entre contas. */
    transferGroupId: uuid('transfer_group_id'),
    transferDirection: transferDirectionEnum('transfer_direction'),
    ...timestamps,
  },
  (table) => [
    // O extrato sempre pagina por occurredAt desc filtrado por userId.
    // Sem este índice composto o app fica lento com ~5k transações.
    index('transactions_user_occurred_idx').on(table.userId, table.occurredAt.desc()),
    index('transactions_user_category_occurred_idx').on(
      table.userId,
      table.categoryId,
      table.occurredAt,
    ),
    index('transactions_user_account_idx').on(table.userId, table.accountId),
    index('transactions_transfer_group_idx').on(table.transferGroupId),
    // amountCents nunca é negativo: o sinal é responsabilidade do kind.
    // A regra vive no banco para não depender de a aplicação lembrar dela.
    check('transactions_amount_positive', sql`${table.amountCents} > 0`),
    // Transferência sempre tem grupo e direção; nada mais tem.
    check(
      'transactions_transfer_shape',
      sql`(${table.kind} = 'transfer') = (${table.transferGroupId} is not null)
          and (${table.kind} = 'transfer') = (${table.transferDirection} is not null)`,
    ),
  ],
);

export const budgets = pgTable(
  'budgets',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: ownerId(),
    categoryId: uuid('category_id')
      .notNull()
      .references(() => categories.id, { onDelete: 'cascade' }),
    /** Sempre o dia 1 do mês. */
    month: date('month', { mode: 'string' }).notNull(),
    limitCents: cents('limit_cents').notNull(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex('budgets_user_category_month_key').on(table.userId, table.categoryId, table.month),
    index('budgets_user_month_idx').on(table.userId, table.month),
  ],
);

export const goals = pgTable(
  'goals',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: ownerId(),
    name: text('name').notNull(),
    targetCents: cents('target_cents').notNull(),
    savedCents: cents('saved_cents').notNull().default(sql`0`),
    deadline: date('deadline', { mode: 'string' }),
    ...timestamps,
  },
  (table) => [index('goals_user_idx').on(table.userId)],
);

export const accountsRelations = relations(accounts, ({ many }) => ({
  transactions: many(transactions),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: 'category_parent',
  }),
  children: many(categories, { relationName: 'category_parent' }),
  transactions: many(transactions),
  budgets: many(budgets),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  account: one(accounts, { fields: [transactions.accountId], references: [accounts.id] }),
  category: one(categories, { fields: [transactions.categoryId], references: [categories.id] }),
  recurrence: one(recurrences, {
    fields: [transactions.recurrenceId],
    references: [recurrences.id],
  }),
}));

export const budgetsRelations = relations(budgets, ({ one }) => ({
  category: one(categories, { fields: [budgets.categoryId], references: [categories.id] }),
}));

export type AccountRow = typeof accounts.$inferSelect;
export type CategoryRow = typeof categories.$inferSelect;
export type TransactionRow = typeof transactions.$inferSelect;
export type BudgetRow = typeof budgets.$inferSelect;
export type GoalRow = typeof goals.$inferSelect;
