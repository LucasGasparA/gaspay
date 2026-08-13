import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../app.js';
import { createTestUser, deleteTestUser, withJson, type TestUser } from './helpers.js';

/**
 * Prova, batendo na API de ponta a ponta (sem mockar nada), que nenhuma rota
 * vaza dado entre usuários — requisito explícito do PLAN.md, seção Segurança:
 * "Escrever teste que prova isso". Duas contas reais, sessão real (via
 * `testUtils` do Better Auth), banco real.
 */
const app = createApp();

interface AccountDTO {
  id: string;
}

async function createAccount(user: TestUser, name: string): Promise<AccountDTO> {
  const res = await app.request('/api/accounts', {
    method: 'POST',
    headers: withJson(user.headers),
    body: JSON.stringify({ name, type: 'checking' }),
  });
  if (res.status !== 201) throw new Error(`falha ao criar conta de teste: ${res.status}`);
  return (await res.json()) as AccountDTO;
}

async function createCategory(user: TestUser, name: string): Promise<{ id: string }> {
  const res = await app.request('/api/categories', {
    method: 'POST',
    headers: withJson(user.headers),
    body: JSON.stringify({ name, icon: 'circle', color: '#820AD1', kind: 'expense' }),
  });
  if (res.status !== 201) throw new Error(`falha ao criar categoria de teste: ${res.status}`);
  return (await res.json()) as { id: string };
}

async function createTransaction(
  user: TestUser,
  accountId: string,
  description: string,
): Promise<{ id: string }> {
  const res = await app.request('/api/transactions', {
    method: 'POST',
    headers: withJson(user.headers),
    body: JSON.stringify({
      accountId,
      amountCents: '1000',
      kind: 'expense',
      occurredAt: new Date().toISOString(),
      description,
    }),
  });
  if (res.status !== 201) throw new Error(`falha ao criar lançamento de teste: ${res.status}`);
  return (await res.json()) as { id: string };
}

describe('isolamento por userId', () => {
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

  it('rejeita request sem sessão', async () => {
    const res = await app.request('/api/accounts');
    expect(res.status).toBe(401);
  });

  it('ignora/rejeita userId mandado no corpo — .strict() não declara o campo', async () => {
    const res = await app.request('/api/accounts', {
      method: 'POST',
      headers: withJson(userA.headers),
      body: JSON.stringify({ name: 'Conta', type: 'checking', userId: userB.userId }),
    });
    expect(res.status).toBe(400);
  });

  describe('accounts', () => {
    it('lista só as contas do próprio usuário', async () => {
      const accountA = await createAccount(userA, 'Conta A');

      const asB = await app.request('/api/accounts', { headers: userB.headers });
      const { items: itemsB } = (await asB.json()) as { items: AccountDTO[] };
      expect(itemsB.some((a) => a.id === accountA.id)).toBe(false);

      const asA = await app.request('/api/accounts', { headers: userA.headers });
      const { items: itemsA } = (await asA.json()) as { items: AccountDTO[] };
      expect(itemsA.some((a) => a.id === accountA.id)).toBe(true);
    });

    it('não deixa editar nem apagar conta de outro usuário (404, não 403)', async () => {
      const accountA = await createAccount(userA, 'Conta A2');

      const patch = await app.request(`/api/accounts/${accountA.id}`, {
        method: 'PATCH',
        headers: withJson(userB.headers),
        body: JSON.stringify({ name: 'Sequestrada' }),
      });
      expect(patch.status).toBe(404);

      const del = await app.request(`/api/accounts/${accountA.id}`, {
        method: 'DELETE',
        headers: userB.headers,
      });
      expect(del.status).toBe(404);
    });
  });

  describe('categories', () => {
    it('lista só as categorias do próprio usuário', async () => {
      const categoryA = await createCategory(userA, 'Categoria A');

      const asB = await app.request('/api/categories', { headers: userB.headers });
      const { items: itemsB } = (await asB.json()) as { items: AccountDTO[] };
      expect(itemsB.some((c) => c.id === categoryA.id)).toBe(false);
    });

    it('não deixa editar nem apagar categoria de outro usuário', async () => {
      const categoryA = await createCategory(userA, 'Categoria A2');

      const patch = await app.request(`/api/categories/${categoryA.id}`, {
        method: 'PATCH',
        headers: withJson(userB.headers),
        body: JSON.stringify({ name: 'Sequestrada' }),
      });
      expect(patch.status).toBe(404);

      const del = await app.request(`/api/categories/${categoryA.id}`, {
        method: 'DELETE',
        headers: userB.headers,
      });
      expect(del.status).toBe(404);
    });

    it('categoria de outro usuário não serve pra etiquetar lançamento', async () => {
      const accountB = await createAccount(userB, 'Conta B');
      const categoryA = await createCategory(userA, 'Categoria A3');

      const res = await app.request('/api/transactions', {
        method: 'POST',
        headers: withJson(userB.headers),
        body: JSON.stringify({
          accountId: accountB.id,
          categoryId: categoryA.id,
          amountCents: '500',
          kind: 'expense',
          occurredAt: new Date().toISOString(),
          description: 'Tentando usar categoria alheia',
        }),
      });
      expect(res.status).toBe(404);
    });
  });

  describe('transactions', () => {
    it('não deixa lançar em conta de outro usuário', async () => {
      const accountA = await createAccount(userA, 'Conta A3');

      const res = await app.request('/api/transactions', {
        method: 'POST',
        headers: withJson(userB.headers),
        body: JSON.stringify({
          accountId: accountA.id,
          amountCents: '2000',
          kind: 'expense',
          occurredAt: new Date().toISOString(),
          description: 'Tentando lançar em conta alheia',
        }),
      });
      expect(res.status).toBe(404);
    });

    it('lista, busca, edita e apaga são isolados por usuário', async () => {
      const accountA = await createAccount(userA, 'Conta A4');
      const txA = await createTransaction(userA, accountA.id, 'Compra da A');

      const listAsB = await app.request('/api/transactions', { headers: userB.headers });
      const { items } = (await listAsB.json()) as { items: { id: string }[] };
      expect(items.some((t) => t.id === txA.id)).toBe(false);

      const getAsB = await app.request(`/api/transactions/${txA.id}`, { headers: userB.headers });
      expect(getAsB.status).toBe(404);

      const patchAsB = await app.request(`/api/transactions/${txA.id}`, {
        method: 'PATCH',
        headers: withJson(userB.headers),
        body: JSON.stringify({ description: 'Sequestrada' }),
      });
      expect(patchAsB.status).toBe(404);

      const deleteAsB = await app.request(`/api/transactions/${txA.id}`, {
        method: 'DELETE',
        headers: userB.headers,
      });
      expect(deleteAsB.status).toBe(404);

      // Confirma que continua acessível pro dono de verdade — o 404 acima é
      // isolamento, não um bug que também bloqueou o dono.
      const getAsA = await app.request(`/api/transactions/${txA.id}`, { headers: userA.headers });
      expect(getAsA.status).toBe(200);
    });
  });
});
