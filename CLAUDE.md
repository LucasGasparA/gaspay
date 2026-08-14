# Dindim

App de finanças pessoais. Monorepo pnpm com três pacotes: `apps/mobile`, `apps/api`, `packages/shared`.

## Stack

- **Mobile** (`apps/mobile`, `@dindim/mobile`): Expo Router SDK 57, TypeScript, TanStack Query para dados remotos (sem Redux/Zustand/MMKV — estado remoto é só react-query, sem persistência local além do SecureStore da sessão). React 19 / React Native 0.86.
- **API** (`apps/api`, `@dindim/api`): Hono + Drizzle ORM + Postgres, rodando com `tsx` em dev e compilado com `tsc` em produção. Auth via Better Auth, **só Google OAuth** (`emailAndPassword: enabled:false`) com allowlist de e-mail — não existe fluxo de senha em lugar nenhum do produto.
- **Shared** (`packages/shared`, `@dindim/shared`): tokens de tema, schemas Zod, helpers de dinheiro (`money.ts`) e data (`date.ts`). Compilado com `tsup`. Mobile e API dependem dele via `workspace:*` — qualquer schema/tipo compartilhado entre os dois vive aqui, não duplique.

Antes de escrever código Expo, leia a versão exata da doc em https://docs.expo.dev/versions/v57.0.0/ — a API muda bastante entre versões majors do Expo e o conhecimento genérico de treinamento costuma estar desatualizado.

## Estrutura

```
apps/mobile/
  app/            rotas (expo-router) — (tabs)/, account/, goal/, transaction/
  components/     UI compartilhada
  hooks/          hooks de dados (use-accounts, use-transactions, ...), um por recurso, todos sobre TanStack Query
  lib/            api client, auth client, tema, config
  plugins/        config plugins custom do Expo (ex.: fix de link NDK Android)

apps/api/
  src/routes/     um arquivo por recurso (accounts, categories, transactions, budgets, goals, analytics, me, health)
  src/db/         schema.ts (tabelas do produto) + auth-schema.ts (tabelas do Better Auth, reexportadas por schema.ts)
  src/middleware/ session, error, rate-limit, request-context
  src/lib/        ownership, serialize, validate, seed, logger
  src/test/       testes de integração (ver seção Testes)

packages/shared/src/
  schemas/        um arquivo Zod por recurso, espelha as tabelas de apps/api/src/db
  theme/          tokens.ts + palette.ts
  money.ts, date.ts
```

Não existe `PLAN.md` nem README de arquitetura na raiz — não documente por fase/roadmap, esse controle foi abandonado. Contexto de trabalho em andamento vive nas mensagens de commit e nos tickets `DDM-N` (ver Commits).

## Comandos

Da raiz (usa `pnpm -r` / `--filter`, workspace `@dindim/*`):

```
pnpm typecheck            # tsc --noEmit em todos os pacotes
pnpm test                 # vitest run em api e shared (mobile não tem testes)
pnpm api                  # dev server da API (tsx watch)
pnpm mobile                # expo start --dev-client
pnpm build                 # build de shared + api (mobile não builda por aqui, é via EAS/expo run)
```

Dentro de `apps/api`: `db:generate` (gera migration Drizzle), `db:push`, `db:studio`. Migrations aplicam sozinhas no boot (`start` roda `migrate.js` antes do server).

Dentro de `apps/mobile`: `android` (`expo run:android`) para build nativo local. Não existe script `build`/`test` no mobile — não invente um.

**Não existe linter configurado** (sem ESLint/Prettier/Biome em nenhum pacote). A única checagem de estilo é `tsc --noEmit` em modo strict (`tsconfig.base.json`: `strict`, `noUncheckedIndexedAccess`, `noImplicitOverride`, `noFallthroughCasesInSwitch`). Não sugira rodar `eslint`/`prettier` — não vai existir.

## Convenções observadas no código

- **Dinheiro é sempre `bigint` em centavos** (`cents()` helper em `apps/api/src/db/schema.ts`), nunca `numeric`/`real`/`number` de ponto flutuante. Formatação/parsing fica em `packages/shared/src/money.ts`.
- **Toda tabela "dona de dado de usuário" usa o helper `ownerId()`** (`user_id uuid` com FK `onDelete: 'cascade'` para `user.id`) — apagar um usuário limpa tudo em cascata via FK, não em código.
- **`process.env` só é lido em um lugar**: `apps/api/src/env.ts`, validado com Zod no boot, falha rápido (`process.exit(1)`) se faltar algo. Não leia `process.env` direto em outro arquivo da API.
- No mobile, a única env var é `EXPO_PUBLIC_API_URL`, lida em `app.config.ts` e exposta via `Constants.expoConfig.extra.apiUrl` — código do app consome `lib/config.ts`, não `process.env` diretamente (garante fallback resolvido).
- Rotas da API seguem o mesmo formato por recurso: handler Hono + `@hono/zod-validator` para validar corpo/query, checagem de ownership (`src/lib/ownership.ts`) antes de qualquer mutação, serialização de `bigint`→string na borda (`src/lib/serialize.ts`). Ao adicionar um recurso novo, copie o padrão de um arquivo de rota existente (ex. `accounts.ts` ou `goals.ts` para CRUD simples, `budgets.ts` para upsert).
- No mobile, cada recurso remoto tem um hook próprio em `hooks/use-<recurso>.ts` sobre TanStack Query, com invalidate-on-success nas mutações (sem update otimista — decisão consciente, não adicione otimismo sem necessidade real).
- Comentários no código (schema, env, hooks) costumam explicar o *porquê* de uma decisão não óbvia (ex.: por que uma coluna existe, por que um valor não é calculado no servidor). Siga esse padrão — comentário só quando explica algo que o código sozinho não deixa claro, nunca "o quê".
- Toggles de preferência sem backend (ex. notificações no Perfil) são uma decisão consciente documentada inline no próprio arquivo — se encontrar um `useState` sem persistência, cheque se já tem comentário explicando antes de assumir que é bug.

## Testes

Só `apps/api` e `packages/shared` têm testes (mobile não tem). Rodam com Vitest.

**Testes da API batem em Postgres real via Docker (`docker compose up -d`, porta 5433 no host — a 5432 já tem um Postgres nativo do Windows nesta máquina), nunca mock.** Usam o plugin `testUtils` do Better Auth (`apps/api/src/test/test-auth.ts` + `helpers.ts`) para logar como usuário de teste sem passar por OAuth de verdade, e chamam a app via `app.request(...)` do Hono (in-process, sem subir servidor HTTP). Ao escrever um teste novo, siga o padrão de `apps/api/src/test/isolation.test.ts` ou `budgets-goals-analytics.test.ts` — não introduza mock de banco.

## Commits

Mensagens em **português**, estilo descritivo (não conventional-commits `tipo:`). Quando a mudança corresponde a um ticket, **sempre inclua a tag entre parênteses no fim** — `(DDM-9, DDM-9a)` para múltiplos, `(DDM-1 a DDM-4)` para faixa. Mudanças sem ticket associado (ex. ajuste pontual, fix de infra) não precisam de tag.

## Coisas para não redescobrir toda sessão

- Auth é só Google + allowlist por e-mail (`ALLOWED_EMAILS`) — não existe cadastro aberto nem senha, mesmo que alguma tela ainda tenha resquício visual de campo de senha.
- Modo escuro só existe na tela Home + tab bar (escopo deliberado, não um dark mode completo) — ver `apps/mobile/lib/theme-context.tsx`.
- `packages/shared/src/theme/palette.ts` tem cores recalculadas para WCAG AA (contraste de luminância relativa) — não troque hex de marca/positivo sem recalcular contraste.
- Build Android local depende de um plugin custom (`apps/mobile/plugins/withAndroidCxxSharedLink.js`) para um bug de link do NDK — se aparecer erro de símbolo indefinido em build nativo, é isso antes de qualquer outra hipótese.
