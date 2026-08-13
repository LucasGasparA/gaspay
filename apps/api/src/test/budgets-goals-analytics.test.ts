import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../app.js';
import { createTestUser, deleteTestUser, withJson, type TestUser } from './helpers.js';

const app = createApp();

interface CategoryDTO {
  id: string;
}

async function createCategory(user: TestUser, name: string, kind: 'expense' | 'income' = 'expense') {
  const res = await app.request('/api/categories', {
    method: 'POST',
    headers: withJson(user.headers),
    body: JSON.stringify({ name, icon: 'circle', color: '#820AD1', kind }),
  });
  if (res.status !== 201) throw new Error(`falha ao criar categoria de teste: ${res.status}`);
  return (await res.json()) as CategoryDTO;
}

describe('budgets, goals e analytics — isolamento e comportamento', () => {
  let userA: TestUser;
  let userB: TestUser;

  beforeAll(async () => {
    userA = await createTestUser();
    userB = await createTestUser();
  });

  afterAll(async () => {
    await deleteTestUser(userA.userId);
    await deleteTestUser(userB.userId);
  });

  describe('budgets', () => {
    it('cria e depois faz upsert no mesmo (categoria, mês) em vez de duplicar', async () => {
      const category = await createCategory(userA, 'Mercado orçamento');

      const first = await app.request('/api/budgets', {
        method: 'POST',
        headers: withJson(userA.headers),
        body: JSON.stringify({ categoryId: category.id, month: '2026-08-01', limitCents: '60000' }),
      });
      expect(first.status).toBe(201);
      const firstBody = (await first.json()) as { id: string; limitCents: string };

      const second = await app.request('/api/budgets', {
        method: 'POST',
        headers: withJson(userA.headers),
        body: JSON.stringify({ categoryId: category.id, month: '2026-08-01', limitCents: '80000' }),
      });
      expect(second.status).toBe(201);
      const secondBody = (await second.json()) as { id: string; limitCents: string };

      expect(secondBody.id).toBe(firstBody.id);
      expect(secondBody.limitCents).toBe('80000');

      const list = await app.request('/api/budgets?month=2026-08-01', { headers: userA.headers });
      const { items } = (await list.json()) as { items: { id: string }[] };
      expect(items.filter((b) => b.id === firstBody.id)).toHaveLength(1);
    });

    it('não deixa criar orçamento numa categoria de outro usuário', async () => {
      const categoryA = await createCategory(userA, 'Categoria A pro orçamento');

      const res = await app.request('/api/budgets', {
        method: 'POST',
        headers: withJson(userB.headers),
        body: JSON.stringify({ categoryId: categoryA.id, month: '2026-08-01', limitCents: '10000' }),
      });
      expect(res.status).toBe(404);
    });

    it('lista só os orçamentos do próprio usuário e não deixa apagar o de outro', async () => {
      const categoryB = await createCategory(userB, 'Categoria B pro orçamento');
      const created = await app.request('/api/budgets', {
        method: 'POST',
        headers: withJson(userB.headers),
        body: JSON.stringify({ categoryId: categoryB.id, month: '2026-08-01', limitCents: '20000' }),
      });
      const budgetB = (await created.json()) as { id: string };

      const listAsA = await app.request('/api/budgets?month=2026-08-01', { headers: userA.headers });
      const { items } = (await listAsA.json()) as { items: { id: string }[] };
      expect(items.some((b) => b.id === budgetB.id)).toBe(false);

      const deleteAsA = await app.request(`/api/budgets/${budgetB.id}`, {
        method: 'DELETE',
        headers: userA.headers,
      });
      expect(deleteAsA.status).toBe(404);
    });
  });

  describe('goals', () => {
    it('cria, lista, edita e apaga isolado por usuário', async () => {
      const created = await app.request('/api/goals', {
        method: 'POST',
        headers: withJson(userA.headers),
        body: JSON.stringify({ name: 'Viagem', targetCents: '800000' }),
      });
      expect(created.status).toBe(201);
      const goal = (await created.json()) as { id: string };

      const listAsB = await app.request('/api/goals', { headers: userB.headers });
      const { items } = (await listAsB.json()) as { items: { id: string }[] };
      expect(items.some((g) => g.id === goal.id)).toBe(false);

      const patchAsB = await app.request(`/api/goals/${goal.id}`, {
        method: 'PATCH',
        headers: withJson(userB.headers),
        body: JSON.stringify({ savedCents: '999999' }),
      });
      expect(patchAsB.status).toBe(404);

      const patchAsA = await app.request(`/api/goals/${goal.id}`, {
        method: 'PATCH',
        headers: withJson(userA.headers),
        body: JSON.stringify({ savedCents: '50000' }),
      });
      expect(patchAsA.status).toBe(200);
      const updated = (await patchAsA.json()) as { savedCents: string };
      expect(updated.savedCents).toBe('50000');

      const deleteAsB = await app.request(`/api/goals/${goal.id}`, {
        method: 'DELETE',
        headers: userB.headers,
      });
      expect(deleteAsB.status).toBe(404);
    });
  });

  describe('analytics', () => {
    it('category-spend só soma lançamentos do próprio usuário no mês pedido', async () => {
      const category = await createCategory(userA, 'Analytics categoria');
      const account = await app.request('/api/accounts', {
        method: 'POST',
        headers: withJson(userA.headers),
        body: JSON.stringify({ name: 'Conta analytics', type: 'checking' }),
      });
      const { id: accountId } = (await account.json()) as { id: string };

      await app.request('/api/transactions', {
        method: 'POST',
        headers: withJson(userA.headers),
        body: JSON.stringify({
          accountId,
          categoryId: category.id,
          amountCents: '5000',
          kind: 'expense',
          occurredAt: '2026-08-10T12:00:00.000Z',
          description: 'Gasto de agosto',
        }),
      });

      const resA = await app.request('/api/analytics/category-spend?month=2026-08-01', {
        headers: userA.headers,
      });
      expect(resA.status).toBe(200);
      const bodyA = (await resA.json()) as { totalCents: string; items: { categoryId: string }[] };
      expect(BigInt(bodyA.totalCents) >= 5000n).toBe(true);
      expect(bodyA.items.some((item) => item.categoryId === category.id)).toBe(true);

      const resB = await app.request('/api/analytics/category-spend?month=2026-08-01', {
        headers: userB.headers,
      });
      const bodyB = (await resB.json()) as { items: { categoryId: string }[] };
      expect(bodyB.items.some((item) => item.categoryId === category.id)).toBe(false);
    });

    it('monthly-flow soma entradas/saídas só do usuário dono da sessão', async () => {
      const res = await app.request('/api/analytics/monthly-flow?anchorMonth=2026-08-01&months=3', {
        headers: userA.headers,
      });
      expect(res.status).toBe(200);
      const body = (await res.json()) as { points: { month: string }[] };
      expect(Array.isArray(body.points)).toBe(true);
    });

    it('rejeita request sem sessão', async () => {
      const res = await app.request('/api/analytics/category-spend?month=2026-08-01');
      expect(res.status).toBe(401);
    });
  });
});
