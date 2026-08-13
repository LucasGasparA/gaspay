import { testAuth } from './test-auth.js';

export interface TestUser {
  userId: string;
  headers: Headers;
}

let counter = 0;

/** Cria um usuário de teste já logado — pronto pra anexar em `app.request()`. */
export async function createTestUser(): Promise<TestUser> {
  counter += 1;
  const ctx = await testAuth.$context;
  const user = ctx.test.createUser({
    email: `isolamento-${Date.now()}-${counter}@teste.local`,
    name: 'Usuário de teste',
  });
  const saved = await ctx.test.saveUser(user);
  const { headers } = await ctx.test.login({ userId: saved.id });
  return { userId: saved.id, headers };
}

/** Apaga o usuário e, via cascade de FK, tudo que ele criou (contas, categorias, lançamentos). */
export async function deleteTestUser(userId: string): Promise<void> {
  const ctx = await testAuth.$context;
  await ctx.test.deleteUser(userId);
}

export function withJson(headers: Headers): Headers {
  const merged = new Headers(headers);
  merged.set('Content-Type', 'application/json');
  return merged;
}
