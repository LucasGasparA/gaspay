/**
 * Script pontual pra popular o banco local com dados de demonstração pro
 * usuário logado (lucasgaspar1595@gmail.com), pra dar pra ver o app com cara
 * de uso real. Não roda em produção, não faz parte do build.
 *
 * Rodar de dentro de apps/api: npx tsx src/scripts/seed-demo.ts
 */
import { eq, sql } from 'drizzle-orm';
import { db, pool } from '../db/index.js';
import { accounts, budgets, categories, goals, transactions, user } from '../db/schema.js';

const DEMO_EMAIL = 'lucasgaspar1595@gmail.com';

function cents(reais: number): bigint {
  return BigInt(Math.round(reais * 100));
}

async function main() {
  const [demoUser] = await db.select().from(user).where(eq(user.email, DEMO_EMAIL));
  if (!demoUser) {
    throw new Error(`Usuário ${DEMO_EMAIL} não existe ainda — faça login no app antes de rodar o seed.`);
  }
  const userId = demoUser.id;

  const [txCountRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(transactions)
    .where(eq(transactions.userId, userId));
  const existingTx = txCountRow?.count ?? 0;
  if (existingTx > 0) {
    throw new Error(
      `Já existem ${existingTx} transações pra esse usuário — apague antes de rodar o seed de novo, pra não duplicar.`,
    );
  }

  const cats = await db.select().from(categories).where(eq(categories.userId, userId));
  const catByName = (name: string) => {
    const found = cats.find((c) => c.name === name);
    if (!found) throw new Error(`Categoria "${name}" não encontrada — rode o login/seed padrão primeiro.`);
    return found;
  };

  const [existingAccount] = await db
    .select()
    .from(accounts)
    .where(eq(accounts.userId, userId))
    .limit(1);

  const checkingId =
    existingAccount?.id ??
    (
      await db
        .insert(accounts)
        .values({ userId, name: 'Nu', type: 'checking', initialBalanceCents: cents(0), color: '#820AD1' })
        .returning({ id: accounts.id })
    )[0]!.id;

  const [savingsAccount] = await db
    .insert(accounts)
    .values({ userId, name: 'Poupança', type: 'savings', initialBalanceCents: cents(5000), color: '#00A868' })
    .returning({ id: accounts.id });
  const savingsId = savingsAccount!.id;

  const [cardAccount] = await db
    .insert(accounts)
    .values({ userId, name: 'Cartão Nubank', type: 'credit_card', initialBalanceCents: cents(0), color: '#5A078F' })
    .returning({ id: accounts.id });
  const cardId = cardAccount!.id;

  const now = new Date();
  const months: { year: number; month: number; isCurrent: boolean }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ year: d.getFullYear(), month: d.getMonth(), isCurrent: i === 0 });
  }

  const txRows: (typeof transactions.$inferInsert)[] = [];
  const at = (year: number, month: number, day: number, hour = 12) => new Date(year, month, day, hour, 0);

  for (const [idx, m] of months.entries()) {
    const lastDay = m.isCurrent ? now.getDate() : new Date(m.year, m.month + 1, 0).getDate();
    const wobble = 1 + ((idx % 3) - 1) * 0.08;

    if (5 <= lastDay) {
      txRows.push({
        userId,
        accountId: checkingId,
        categoryId: catByName('Salário').id,
        amountCents: cents(6500),
        kind: 'income',
        occurredAt: at(m.year, m.month, 5),
        description: 'Salário',
      });
    }
    if (idx % 2 === 0 && 20 <= lastDay) {
      txRows.push({
        userId,
        accountId: checkingId,
        categoryId: catByName('Freelance').id,
        amountCents: cents(90 + (idx % 3) * 20),
        kind: 'income',
        occurredAt: at(m.year, m.month, 20),
        description: 'Projeto freelance',
      });
    }

    const expenses: { day: number; category: string; amount: number; account: string; description: string }[] = [
      { day: 10, category: 'Moradia', amount: 1800, account: 'checking', description: 'Aluguel' },
      { day: 3, category: 'Mercado', amount: 380 * wobble, account: 'checking', description: 'Supermercado' },
      { day: 17, category: 'Mercado', amount: 290 * wobble, account: 'checking', description: 'Supermercado' },
      { day: 25, category: 'Mercado', amount: 150 * wobble, account: 'checking', description: 'Feira' },
      { day: 8, category: 'Restaurante', amount: 85, account: 'card', description: 'Jantar fora' },
      { day: 15, category: 'Restaurante', amount: 120 * wobble, account: 'card', description: 'Almoço com amigos' },
      { day: 22, category: 'Restaurante', amount: 65, account: 'card', description: 'iFood' },
      { day: 2, category: 'Transporte', amount: 45, account: 'checking', description: 'Uber' },
      { day: 12, category: 'Transporte', amount: 220, account: 'checking', description: 'Combustível' },
      { day: 6, category: 'Assinaturas', amount: 55.9, account: 'card', description: 'Netflix + Spotify' },
      { day: 6, category: 'Assinaturas', amount: 34.9, account: 'card', description: 'iCloud + Google One' },
      { day: 18, category: 'Lazer', amount: 140 * wobble, account: 'card', description: 'Cinema' },
      { day: 4, category: 'Contas', amount: 180, account: 'checking', description: 'Energia elétrica' },
      { day: 4, category: 'Contas', amount: 110, account: 'checking', description: 'Internet' },
      { day: 9, category: 'Saúde', amount: 150, account: 'checking', description: 'Farmácia' },
    ];

    for (const e of expenses) {
      if (e.day > lastDay) continue;
      txRows.push({
        userId,
        accountId: e.account === 'card' ? cardId : checkingId,
        categoryId: catByName(e.category).id,
        amountCents: cents(e.amount),
        kind: 'expense',
        occurredAt: at(m.year, m.month, e.day),
        description: e.description,
      });
    }

    if (28 <= lastDay) {
      const transferGroupId = crypto.randomUUID();
      txRows.push(
        {
          userId,
          accountId: checkingId,
          categoryId: null,
          amountCents: cents(300),
          kind: 'transfer',
          transferDirection: 'out',
          transferGroupId,
          occurredAt: at(m.year, m.month, 28),
          description: 'Aporte pra poupança',
        },
        {
          userId,
          accountId: savingsId,
          categoryId: null,
          amountCents: cents(300),
          kind: 'transfer',
          transferDirection: 'in',
          transferGroupId,
          occurredAt: at(m.year, m.month, 28),
          description: 'Aporte pra poupança',
        },
      );
    }
  }

  await db.insert(transactions).values(txRows);

  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  await db.insert(budgets).values([
    { userId, categoryId: catByName('Mercado').id, month: currentMonthStr, limitCents: cents(1000) },
    { userId, categoryId: catByName('Restaurante').id, month: currentMonthStr, limitCents: cents(250) },
    { userId, categoryId: catByName('Lazer').id, month: currentMonthStr, limitCents: cents(300) },
    { userId, categoryId: catByName('Assinaturas').id, month: currentMonthStr, limitCents: cents(90) },
    { userId, categoryId: catByName('Transporte').id, month: currentMonthStr, limitCents: cents(400) },
  ]);

  await db.insert(goals).values([
    {
      userId,
      name: 'Viagem pra Bariloche',
      targetCents: cents(8000),
      savedCents: cents(3200),
      deadline: '2026-12-01',
    },
    {
      userId,
      name: 'Reserva de emergência',
      targetCents: cents(15000),
      savedCents: cents(9000),
      deadline: null,
    },
  ]);

  console.log(`Seed ok: ${txRows.length} transações, 3 contas, 5 orçamentos, 2 metas pra ${DEMO_EMAIL}.`);
}

main()
  .catch((err) => {
    console.error(err.message ?? err);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
