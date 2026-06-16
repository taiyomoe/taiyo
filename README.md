# Taiyō

![Taiyō's banner](https://cdn.taiyo.moe/assets/banner-red.png)

A manga reading platform — manga, manhwa, manhua, light novels — being rebuilt from scratch on the `rewrite` branch. This branch currently ships the backend (Hono API) and a Storybook component playground; the Next.js web app and background workers are planned but not yet checked in.

## 🌟 Features

- **Multi-format support**: manga, manhwa, manhua, light novels
- **Multi-language**: official Portuguese / French, technical capability for 100+ languages
- **Typo-tolerant search**: Meilisearch-backed `/medias/search`
- **Authentication**: email + magic-link + Discord/Google via Better Auth, with Turnstile captcha and Dragonfly-backed rate limits
- **Content rating system**: Normal / Suggestive / NSFW / NSFL
- **Image pipeline**: server-side magic-byte validation, EXIF stripping, JPEG transcoding via sharp
- **Group ownership workflow**: scanlation groups can be claimed by their actual owners through a request/approval flow; chapter and group mutations gate on membership (additive model — uploaders/mods/admins keep unconditional access)
- **Observability**: HyperDX (OpenTelemetry) drains via evlog

Not yet in this branch (planned): Next.js frontend, user library / history / follows routes (schemas exist, routes don't), chapter page upload, audit log instrumentation, BullMQ job workers.

## 🏗️ Architecture

Monorepo powered by [Turborepo](https://turbo.build/) and [pnpm workspaces](https://pnpm.io/workspaces).

### 📁 Project structure

```no-highlight
taiyo/
├── apps/
│   ├── api/               # Hono + hono-openapi backend, port 3002
│   └── storybook/         # @taiyomoe/ui component playground, port 6006
├── packages/
│   ├── auth/              # Better Auth config + plugins + lifecycle hooks
│   ├── cache/             # Dragonfly (Redis-compatible) client
│   ├── config/            # Shared configuration constants
│   ├── db/                # Kysely setup, migrations, seeds, model types
│   ├── email/             # Email templates (react-email)
│   ├── s3/                # S3 client + key helpers (works with RustFS / Garage / AWS)
│   ├── schemas/           # Cross-package Zod schemas (pagination, etc.)
│   ├── scripts/           # One-shot CLI scripts (init-meilisearch, etc.)
│   ├── search/            # Meilisearch client + media sync + filter translator
│   ├── ui/                # Shared React components (Tailwind 4 + Base UI)
│   └── utils/             # Pure utility helpers (unit-tested)
├── docs/                  # Design proposals (group-ownership.md, …)
└── tooling/
    ├── bruno/             # API request collections
    ├── github/            # CI setup composite action
    └── typescript/        # tsconfig presets
```

### 🛠️ Tech stack

**API (`apps/api`):**

- [Hono](https://hono.dev/) + [hono-openapi](https://github.com/honojs/middleware/tree/main/packages/openapi-spec) for routes and a Scalar-rendered `/docs` UI
- [Kysely](https://kysely.dev/) (typed SQL query builder) on [PostgreSQL](https://www.postgresql.org/)
- [Better Auth](https://www.better-auth.com/) (email/password + magic link + OAuth, with CASL-based ability checks)
- [Zod 4](https://zod.dev/) for input validation
- [sharp](https://sharp.pixelplumbing.com/) + [magic-bytes.js](https://github.com/LarsKoelpin/magic-bytes) for upload validation
- [evlog](https://github.com/evlog/evlog) → HyperDX (OpenTelemetry) for structured logs

**UI (`apps/storybook` + `packages/ui`):**

- [React 19](https://react.dev/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [Base UI](https://base-ui.com/) for accessible primitives
- Storybook 10 for component documentation

**Infrastructure (`docker-compose.yml`):**

- [PostgreSQL 18](https://www.postgresql.org/) — primary database
- [Meilisearch](https://www.meilisearch.com/) — search index
- [Dragonfly](https://www.dragonflydb.io/) — Redis-compatible cache (Better Auth secondary storage, rate limits)
- [RustFS](https://rustfs.com/) — S3-compatible object store for cover/banner/staff images
- [HyperDX](https://www.hyperdx.io/) — observability stack

## 🚀 Getting started

### Prerequisites

- **Node.js**: see `engines.node` in `package.json` (`pnpm` will warn if mismatched)
- **pnpm**: see `packageManager` in `package.json`
- **Docker & Docker Compose** for local infrastructure

### Setup

1. Clone and install
   ```bash
   git clone https://github.com/taiyomoe/taiyo.git
   cd taiyo
   pnpm install
   ```
2. Copy env template and fill in values
   ```bash
   cp .env.example .env
   ```
   `BETTER_AUTH_SECRET` is the only var you must set yourself (`npx auth secret` generates one); social OAuth and Turnstile work without credentials but those flows will be disabled.
3. Start infrastructure
   ```bash
   docker compose up -d
   ```
4. Initialize storage — see [`packages/s3/README.md`](./packages/s3/README.md) for first-run RustFS bucket setup.
5. Migrate + seed the database
   ```bash
   pnpm -F db kysely migrate latest
   pnpm -F db kysely seed run
   ```
6. Run dev

   ```bash
   pnpm dev
   ```

   - API: <http://localhost:3002> (`/docs` for the OpenAPI viewer, `/ping` for a health check)
   - Storybook: <http://localhost:6006>

## 📝 Available scripts

Root-level:

```bash
pnpm dev                # turbo dev --parallel — runs every app's dev script
pnpm build              # turbo build
pnpm format             # oxfmt --check
pnpm format:fix         # oxfmt (in place)
pnpm lint               # oxlint (type-aware; doubles as the typecheck gate)
pnpm lint:fix           # oxlint --fix
pnpm lint:ws            # sherif — workspace dependency validation
pnpm knip               # unused exports + dead deps
pnpm test:unit          # vitest (vitest.config.unit.ts)
pnpm test:integration   # vitest (vitest.config.integration.ts) — requires docker compose up
```

Package-specific:

```bash
pnpm -F db kysely migrate latest   # apply migrations
pnpm -F db kysely seed run         # seed sample data
pnpm -F storybook dev              # storybook dev server
pnpm -F storybook build            # static storybook build
pnpm -F api dev                    # tsx-watch the API
```

## 🔧 Development

### Branches

- `main` — production code
- `develop` — integration branch for features
- `rewrite` — current full-stack rebuild (this branch)
- `feature/*`, `hotfix/*`, `release/*` — see git-flow

### Code quality

- **Linting + typecheck**: [oxlint](https://oxc.rs/docs/guide/usage/linter.html) with `typeAware: true` + `typeCheck: true` — this is the type gate; there's no separate `tsc --noEmit` step
- **Formatting**: [oxfmt](https://oxc.rs/docs/guide/usage/formatter.html)
- **Workspace deps**: [sherif](https://github.com/QuiiBz/sherif)
- **Dead code**: [knip](https://knip.dev/)
- **Pre-commit**: [lefthook](https://github.com/evilmartians/lefthook) runs `format` + `lint` on staged files

### Package management

- Internal packages: `workspace:^`
- Always `pnpm` (never `npm`/`yarn`)
- Renovate is currently disabled while the rewrite stabilizes

### Testing

- Unit tests live next to source under `__tests__/` (Vitest, fast)
- Integration tests live under `apps/api/src/__integration-tests__/` and hit real Postgres / S3 / Meilisearch / Dragonfly via Docker. Each test gets a freshly-cloned Postgres database (`CREATE DATABASE … TEMPLATE …`) and a fresh S3 bucket for isolation. See `.agents/skills/create-backend-route/SKILL.md` for the conventions.

## 🌐 Environment variables

See `.env.example` for the full list. Validation is centralized via [`@t3-oss/env-core`](https://env.t3.gg/) in each package's `env.ts`.

## 📦 Package overview

- **`@taiyomoe/db`** — Kysely + migrations + seeds + per-table model types
- **`@taiyomoe/auth`** — Better Auth config, lifecycle hooks, server + client exports
- **`@taiyomoe/cache`** — Dragonfly (ioredis) client, namespaced cache helpers
- **`@taiyomoe/config`** — runtime constants (image limits, auth limits, OpenAPI metadata)
- **`@taiyomoe/email`** — react-email templates + send helpers
- **`@taiyomoe/s3`** — typed S3 client + key derivation
- **`@taiyomoe/schemas`** — shared Zod schemas (pagination meta, etc.)
- **`@taiyomoe/scripts`** — CLI scripts (init-meilisearch, etc.)
- **`@taiyomoe/search`** — Meilisearch client + media sync + search input schema
- **`@taiyomoe/ui`** — React components on Tailwind 4 + Base UI
- **`@taiyomoe/utils`** — pure helpers (unit-tested)

## 🚀 Deployment

The repo expects deployment via [Coolify](https://coolify.io/) onto S3-compatible storage (RustFS for `taiyo-ci`, Garage for production), with Cloudflare in front. Production secrets are not committed; `.env.prod` is gitignored.

## 🤝 Contributing

1. Fork the repo
2. Branch off `develop` (or `rewrite` while the rewrite is active)
3. Make your changes
4. Run `pnpm format:fix && pnpm lint:fix && pnpm test:unit && pnpm test:integration`
5. Open a PR

### Guidelines

- Match existing patterns (especially handler / middleware / router structure under `apps/api`)
- Conventional Commits style for messages
- Add or update tests for any behavior change
- Update docs when the public surface changes

## 📄 License

MIT — see [LICENSE](LICENSE).

## 🙏 Acknowledgments

- [MangaDex](https://mangadex.org/) for UI inspiration and manga data
