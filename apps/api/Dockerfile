# Build de dentro do monorepo (contexto = raiz do repo, não apps/api) porque
# a API depende de @dindim/shared via workspace:*.
#
# Usado pelo Railway via railway.json (builder=DOCKERFILE) na raiz — o watch
# path do serviço é /apps/api/**, então mudanças só aqui disparam rebuild.

FROM node:22-bookworm-slim AS base
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc tsconfig.base.json ./
COPY scripts ./scripts
COPY packages/shared/package.json ./packages/shared/package.json
COPY apps/api/package.json ./apps/api/package.json
RUN pnpm install --frozen-lockfile

FROM deps AS build
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api
RUN pnpm --filter @dindim/shared build && pnpm --filter @dindim/api build
# Sem `pnpm prune --prod` aqui: com node-linker=hoisted ele quebra o symlink
# local de @dindim/shared (bug conhecido dessa combinação). A imagem fica
# maior carregando devDependencies, mas funciona — não é a imagem de deploy.

FROM base AS runtime
ENV NODE_ENV=production
COPY --from=build /app /app
WORKDIR /app/apps/api
EXPOSE 3000
HEALTHCHECK --interval=10s --timeout=3s --start-period=10s --retries=5 \
  CMD node -e "fetch('http://localhost:3000/health').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"
CMD ["sh", "-c", "node dist/migrate.js && node dist/index.js"]
