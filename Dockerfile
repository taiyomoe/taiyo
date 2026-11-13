# syntax=docker/dockerfile:1

# One Dockerfile for every deployable app. Pick the app with the APP build arg and the
# runtime with the target:
#   docker build --build-arg APP=api    --target server .
#   docker build --build-arg APP=worker --target server .
#   docker build --build-arg APP=web    --target web    --build-arg VITE_API_URL=... .
# The api image also runs database migrations:
#   node --import tsx /repo/packages/db/src/migrate.ts

ARG NODE_VERSION=26.3.0

FROM node:${NODE_VERSION}-slim AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
ENV CI=true
RUN npm install --global pnpm@11.21.0
WORKDIR /repo

# Keep only the app and the workspace packages it depends on, so an unrelated change
# does not invalidate the dependency layers below. turbo prune leaves out the root
# tsconfig.json, which every package extends: tsx needs its jsx setting for the email
# templates, and Vite for its compiler options.
FROM base AS pruner
ARG APP
COPY . .
RUN pnpm dlx turbo@2.11.10 prune @taiyomoe/${APP} --docker && cp tsconfig.json out/full/

# Scripts are skipped: the root postinstall only sets up dev tooling, and sharp ships
# prebuilt binaries as optional dependencies.
FROM base AS prod-deps
COPY --from=pruner /repo/out/json/ .
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile --prod --ignore-scripts

FROM base AS web-build
COPY --from=pruner /repo/out/json/ .
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile --ignore-scripts
COPY --from=pruner /repo/out/full/ .
# Vite inlines VITE_* values into the client bundle, so they are fixed at build time.
# They are public by design: never pass a secret here.
ARG VITE_API_URL
ARG VITE_BETTER_AUTH_URL
ARG VITE_TURNSTILE_SITE_KEY
ARG VITE_DISCORD_INVITE_URL
# Vite runs directly: `pnpm run` would first re-check the install and fire the root
# postinstall, which needs git.
WORKDIR /repo/apps/web
RUN node_modules/.bin/vite build

# api and worker run their TypeScript sources through tsx: workspace packages export
# .ts files, so there is nothing to compile.
FROM base AS server
ARG APP
ENV NODE_ENV=production
COPY --from=prod-deps /repo/ .
COPY --from=pruner /repo/out/full/ .
WORKDIR /repo/apps/${APP}
USER node
CMD ["node", "--import", "tsx", "src/index.ts"]

FROM base AS web
ENV NODE_ENV=production
COPY --from=prod-deps /repo/ .
COPY --from=web-build /repo/apps/web/dist /repo/apps/web/dist
WORKDIR /repo/apps/web
USER node
EXPOSE 3000
CMD ["node_modules/.bin/srvx", "serve", "--prod", "--port", "3000", "--entry", "./dist/server/server.js", "--static", "../client"]
