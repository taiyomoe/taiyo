# Plan 003: Stand up the web↔api data layer and prove it on one route

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 458557fb..HEAD -- apps/web apps/api/src/index.ts apps/api/src/middlewares/context-middleware.ts`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED
- **Depends on**: none (but plans 001/002 make the proven route render images)
- **Category**: direction
- **Planned at**: commit `458557fb`, 2026-09-21

## Why this matters

`apps/api` mounts 9 routers over 74 handlers — a complete reading-platform API
with search, chapters, library, history, lists, follows and group ownership,
all integration-tested. **It has no consumer.** `apps/web` contains zero
`fetch`, zero `createServerFn`, zero `useQuery`, zero `hc()`. Its only network
traffic is Better Auth. There is no API base URL in `apps/web/.env.example` and
no query client in `apps/web/package.json`.

Every remaining frontend feature — browse, media detail, the reader, library,
search — is blocked on this one missing seam. This plan builds it once,
deliberately, and proves it end to end on a single route so the pattern is
established before anyone writes a second one.

## The client decision — already made, and why

Do **not** re-litigate this. Three options were evaluated against the code:

1. **Hono RPC (`hc<typeof app>`)** — *rejected, and the reason is concrete.*
   RPC infers request types from Hono's own `validator()` middleware and
   response types from `TypedResponse`. This repo uses neither:
   - `apps/api/src/middlewares/validate-json-middleware.ts:10` is a plain
     `createMiddleware` that stashes the parsed body in `c.set("json", …)`.
     Hono's RPC type machinery cannot see it, so **request bodies would be
     untyped**.
   - `apps/api/src/middlewares/context-middleware.ts:13` declares
     `ok: <T>(data: T, meta?) => Response` — a plain `Response`, not a
     `TypedResponse`. Every handler returns `c.ok(...)`, so **every RPC call
     would infer as `Response`** and you would gain nothing over `fetch`.
   RPC would cost a dependency and deliver no types.

2. **OpenAPI-generated types** — *chosen.* Every one of the 74 handlers already
   ships a complete `describeRoute({ responses: { … resolver(schema) } })`
   spec, and the app serves `/openapi.json` (`apps/api/src/index.ts:77`) and a
   Scalar UI at `/docs`. The schemas are the real contract here, and they are
   already maintained — `.agents/skills/create-backend-route/SKILL.md` makes
   writing them mandatory for every new route.

3. **Hand-rolled `fetch` wrappers** — rejected: 74 endpoints, no type safety,
   guaranteed drift.

So: `openapi-typescript` (dev, generates `.d.ts` from the spec) +
`openapi-fetch` (tiny typed runtime client), with `@tanstack/react-query` for
caching and `@tanstack/react-router-ssr-query` for SSR dehydration.

## Current state

### `apps/web/package.json:19-39` — dependencies today

No `@tanstack/react-query`, no `@tanstack/react-router-ssr-query`, no `hono`,
no OpenAPI tooling. Confirm with:
`grep -nE "react-query|openapi|hono" apps/web/package.json` → no matches.

`apps/web/AGENTS.md` (section "Deviations from raw CLI output") records that
`@tanstack/react-router-ssr-query` was *deliberately dropped* during scaffolding
— *"TanStack Query↔Router SSR; no QueryClient here"*. This plan reverses that
decision on purpose. Update that AGENTS.md line as part of step 8.

### `apps/web/src/router.tsx` (the whole file)

```tsx
import { createRouter as createTanStackRouter } from "@tanstack/react-router"
import { routeTree } from "./routeTree.gen"

export function getRouter() {
  return createTanStackRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
  })
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
```

No `context`, no query client.

### `apps/web/src/routes/__root.tsx:34-50` — the shell

```tsx
function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html className={darkModeClassName} lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <TanStackDevtools
          config={{ position: "bottom-right" }}
          plugins={[{ name: "Tanstack Router", render: <TanStackRouterDevtoolsPanel /> }]}
        />
        <Scripts />
      </body>
    </html>
  )
}
```

`createRootRoute` (not `createRootRouteWithContext`), and **no providers of any
kind**. No route in `apps/web/src/routes/` has a `loader`, `beforeLoad`,
`errorComponent` or `pendingComponent` — verify with
`grep -rn "loader\|beforeLoad\|errorComponent" apps/web/src/routes/`; the only
hit is a StyleX style key named `loader` in
`apps/web/src/components/buttons/sun-button.tsx:73`.

### `apps/web/src/env/client.ts` (the whole file)

```ts
import { createEnv } from "@t3-oss/env-core"
import { clientEnv as authEnv } from "@taiyomoe/auth/env-client"
import { z } from "zod"

export const env = createEnv({
  extends: [authEnv],
  clientPrefix: "VITE_",
  client: {
    /** Where copyright notices, privacy requests and general support mail go. */
    VITE_SUPPORT_EMAIL: z.email().default("support@taiyo.moe"),
  },
  runtimeEnv: import.meta.env,
})
```

This is the file to extend with `VITE_API_URL`. Match its JSDoc-comment style.

### The CORS trap — read this before you debug anything

`apps/api/src/index.ts:36-38,52-59`:

```ts
const corsOrigins = (env.CORS_ALLOWED_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean)
// …
      cors({
        origin: corsOrigins.length > 0 ? corsOrigins : [],
        credentials: corsOrigins.length > 0,
```

`apps/api/.env.example` ships `CORS_ALLOWED_ORIGINS=""`, so **the default
configuration allows no cross-origin requests at all**. Browser calls from
`http://localhost:3000` to the API on `:3002` will fail until this is set.
Step 2 handles it.

### The search endpoint you will prove against

`POST /medias/search` (`apps/api/src/handlers/search-medias-handler.ts:77`) —
public, rate-limited 60/60s, returns `apiSuccessEnvelope(mediaHitSchema.array(),
paginationMetaSchema)`. It is a **POST that performs a read**, because the
filter/sort payload is too large for a query string. Note this when you set up
query keys: the request body is part of the cache key.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Install | `pnpm install` | exit 0 |
| Lint + typecheck | `pnpm lint` | exit 0 |
| Format check / fix | `pnpm format` / `pnpm format:fix` | exit 0 |
| Workspace dep check | `pnpm lint:ws` | exit 0 |
| Dead code check | `pnpm knip` | exit 0 |
| Start infra | `docker compose up -d` | services healthy |
| Migrate + seed | `pnpm -F db kysely migrate latest && pnpm -F db kysely seed run` | exit 0 |
| Run API | `pnpm -F api dev` | listening on :3002 |
| Run web | `pnpm -F web dev` | listening on :3000 |
| Build web | `pnpm -F web build` | exit 0 |
| Unit tests | `pnpm test:unit` | all pass |

`pnpm lint` is the type gate; there is no separate `tsc --noEmit`.

## Scope

**In scope**:

- `apps/web/package.json`
- `apps/web/.env.example`
- `apps/web/src/env/client.ts`
- `apps/web/src/lib/api.ts` (create)
- `apps/web/src/lib/api-types.d.ts` (create — generated)
- `apps/web/src/router.tsx`
- `apps/web/src/routes/__root.tsx`
- `apps/web/src/routes/titles.tsx` (create — the proving route)
- `apps/web/AGENTS.md`
- `apps/api/.env.example` (the CORS line only)
- `turbo.json` (`globalEnv` entry for `VITE_API_URL`)
- `knip.ts` only if the generated `.d.ts` trips it

**Out of scope** (do NOT touch):

- Any file under `apps/api/src/` — no API changes belong in this plan. If an
  endpoint's shape is wrong for the UI, report it; do not edit it here.
- `apps/web/src/routeTree.gen.ts` — generated. It will regenerate when you add
  a route file; commit the result but never hand-edit it.
- `apps/web/src/components/landing/**`, `.../auth/**`, `.../scene/**`,
  `apps/web/src/routes/{index,terms,privacy,dmca}.tsx` — the existing static
  surfaces. Do not convert them to data-driven pages in this plan.
- `packages/auth` — session wiring is deliberately deferred; see Maintenance.
- StyleX theming, tokens, or anything under `packages/ui`.

## Git workflow

- Branch: `advisor/003-web-api-data-layer` off `rewrite`.
- Conventional Commits. Suggested: `feat(web): wire the typed api client and query layer`.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Add the dependencies

From the repo root (never `npm`/`yarn`; internal packages use `workspace:^`):

```bash
pnpm -F web add @tanstack/react-query @tanstack/react-router-ssr-query openapi-fetch
pnpm -F web add -D openapi-typescript
```

Then run `pnpm lint:ws` — sherif enforces that shared dependency versions match
across workspace packages. If it reports a mismatch (e.g. a `@tanstack/*`
version already pinned in another app), align to the existing version rather
than upgrading the other package.

**Verify**: `pnpm install` → exit 0; `pnpm lint:ws` → exit 0.

### Step 2: Configure the API URL and unblock CORS

In `apps/web/.env.example`, add:

```dotenv
# API
VITE_API_URL="http://localhost:3002"
```

In `apps/web/src/env/client.ts`, add to the `client` object, matching the
existing JSDoc style:

```ts
    /** Base URL of the Taiyō API. No trailing slash. */
    VITE_API_URL: z.url(),
```

In `apps/api/.env.example`, change the CORS line so local development works:

```dotenv
CORS_ALLOWED_ORIGINS="http://localhost:3000"
```

Add `"VITE_API_URL"` to `turbo.json`'s `globalEnv` array.

**Verify**: `grep -n "VITE_API_URL" apps/web/.env.example apps/web/src/env/client.ts turbo.json`
→ one match per file.

### Step 3: Generate the API types

Add a script to `apps/web/package.json`:

```json
"generate:api": "openapi-typescript http://localhost:3002/openapi.json -o ./src/lib/api-types.d.ts"
```

Start the infra and the API (`docker compose up -d`, then `pnpm -F api dev` in
another shell), then run `pnpm -F web generate:api`.

Commit the generated file. It is a build input, not a build artifact — the web
app must typecheck in CI without a running API.

**Verify**: `apps/web/src/lib/api-types.d.ts` exists, is non-empty, and
`grep -c "/medias/search" apps/web/src/lib/api-types.d.ts` returns at least 1.

### Step 4: Create the typed client

Create `apps/web/src/lib/api.ts`:

```ts
import createClient from "openapi-fetch"
import { env } from "@/env/client"
import type { paths } from "./api-types"

/**
 * Typed client for the Taiyō API.
 *
 * `credentials: "include"` forwards the Better Auth session cookie; the API
 * only honours it for origins listed in its `CORS_ALLOWED_ORIGINS`.
 */
export const api = createClient<paths>({
  baseUrl: env.VITE_API_URL,
  credentials: "include",
})
```

The `@/*` alias already resolves to `apps/web/src/*` — see
`apps/web/AGENTS.md` ("Key architectural decisions", item 2) and
`apps/web/vite.config.ts`'s StyleX `aliases` entry. Use it; do not add a new
alias.

Every API response is wrapped in `apiSuccessEnvelope` — the payload is on
`.data`, pagination on `.meta`, and failures come back as
`{ success: false, code, … }`. Add a small helper in the same file that
unwraps the envelope and throws on `success: false`, so route loaders do not
each reimplement it.

**Verify**: `pnpm lint` → exit 0.

### Step 5: Wire the query client into the router

Rewrite `apps/web/src/router.tsx` to create a `QueryClient`, pass it as router
`context`, and register it via `setupRouterSsrQueryIntegration` from
`@tanstack/react-router-ssr-query` so server-fetched data dehydrates into the
client.

**Read the TanStack Start guidance before writing this.** `apps/web/AGENTS.md`
instructs: run `npx @tanstack/intent@latest list` and
`npx @tanstack/intent@latest load @tanstack/start-client-core#start-core`, and
follow the returned `SKILL.md`. Do that — this is the one step where guessing
the API shape will cost you.

Change `createRootRoute` to `createRootRouteWithContext<{ queryClient: QueryClient }>()`
in `apps/web/src/routes/__root.tsx`.

**Verify**: `pnpm lint` → exit 0; `pnpm -F web dev` starts without console
errors; `pnpm -F web build` → exit 0.

### Step 6: Add providers to the shell

In `apps/web/src/routes/__root.tsx`'s `RootDocument`, wrap `{children}` in the
`QueryClientProvider`. Add the React Query devtools panel to the existing
`TanStackDevtools` `plugins` array alongside the router panel — match the
existing object shape exactly.

Do not restructure the `<html>`/`<head>`/`<body>` markup, and do not touch the
`darkModeClassName` line (`__root.tsx:11`) — the hard-coded dark theme is a
separate, deliberate decision.

**Verify**: `pnpm -F web dev` → the landing page at `http://localhost:3000`
still renders unchanged, and React Query devtools appear.

### Step 7: Prove it on one route

Create `apps/web/src/routes/titles.tsx`: a route whose `loader` calls
`POST /medias/search` through the typed client with an empty query (browse
mode) and renders the resulting media hits as a plain list — **title text
only**. No grid, no cover images, no filters, no styling ambition. This route
exists to prove the seam, and plan 005 replaces it with the real surface.

It must demonstrate all four of:

1. SSR — the list is present in the initial HTML.
   Verify: `curl -s http://localhost:3000/titles | grep -c "<li"` → > 0.
2. Hydration without refetch — the devtools show the query already populated.
3. `errorComponent` — a route-level error boundary that renders the API's
   error `code` when the call fails.
4. `pendingComponent` — a loading state.

Use `@taiyomoe/ui` components for anything visual, imported by path (there is
no barrel):
`import { Spinner } from "@taiyomoe/ui/components/ui/spinner"`. Styling goes
through StyleX `stylex.create` only — this repo has no utility-class framework.

Add the route's user-visible strings to `apps/web/messages/en.json` and read
them via `import { m } from "@/paraglide/messages"`, matching how
`apps/web/src/routes/index.tsx:13` does it. Do not hardcode English in JSX.

**Verify**: with infra + API + web running:
- `curl -s http://localhost:3000/titles | grep -c "<li"` → greater than 0
- Stop the API, reload `/titles` → the `errorComponent` renders, the page does
  not blank out or throw an unhandled error.

### Step 8: Update the app's own documentation

`apps/web/AGENTS.md` is now materially wrong. Fix exactly these claims:

- The opening description calls it "a **blank TanStack Start (React)** app …
  No partner add-ons, no feature scaffolding". It has a landing page, auth
  forms, three legal routes and now a data layer.
- "**Environment variables** — **None.**" It has four
  (`VITE_BETTER_AUTH_URL`, `VITE_TURNSTILE_SITE_KEY`, `VITE_SUPPORT_EMAIL`,
  and now `VITE_API_URL`).
- The "Dropped unused deps" bullet lists `@tanstack/react-router-ssr-query` as
  deliberately removed. Record that plan 003 re-added it, and why (the reason
  given — "no QueryClient here" — no longer holds).

Add a short "Data layer" section documenting: the client lives in
`src/lib/api.ts`, types are generated by `pnpm -F web generate:api` and
committed, and the envelope-unwrapping helper is the one way to read responses.

**Verify**: `grep -n "None\." apps/web/AGENTS.md` no longer matches the
environment-variables section.

### Step 9: Full gate

**Verify**: `pnpm format` → 0; `pnpm lint` → 0; `pnpm lint:ws` → 0;
`pnpm knip` → 0; `pnpm test:unit` → pass; `pnpm -F web build` → 0.

If `pnpm knip` flags the generated `api-types.d.ts`, add an ignore entry in
`knip.ts` rather than deleting the file.

## Test plan

This repo runs Vitest from the root (`vitest.config.unit.ts` globs
`**/__tests__/**`); `apps/web` deliberately defines no local test script. Do
not add one.

- **New unit test**: `apps/web/src/lib/__tests__/api.test.ts` covering the
  envelope-unwrapping helper from step 4 — success returns `.data`, a
  `success: false` body throws carrying the `code`, and pagination `meta` is
  preserved. Mock `fetch`; do not hit a real API.
- **Structural pattern**: `packages/utils/src/__tests__/extension-for-mime-type.test.ts`.
- **Not unit-tested**: SSR and hydration. Those are verified by the `curl`
  checks in step 7 — state the results in your report.
- **Verification**: `pnpm test:unit` → all pass, including the new tests.

## Done criteria

ALL must hold:

- [ ] `pnpm lint` exits 0
- [ ] `pnpm format` exits 0
- [ ] `pnpm lint:ws` exits 0
- [ ] `pnpm knip` exits 0
- [ ] `pnpm test:unit` exits 0, including the new `api.test.ts`
- [ ] `pnpm -F web build` exits 0
- [ ] `curl -s http://localhost:3000/titles | grep -c "<li"` returns > 0 with
      infra, API and web running
- [ ] `grep -rn "VITE_API_URL" apps/web/src/env/client.ts apps/web/.env.example turbo.json`
      → one match per file
- [ ] `apps/web/src/lib/api-types.d.ts` is committed and non-empty
- [ ] `git status --porcelain` lists only files from the In-scope list
      (plus the regenerated `routeTree.gen.ts`)
- [ ] `plans/README.md` status row for 003 updated

## STOP conditions

Stop and report back (do not improvise) if:

- `pnpm -F web generate:api` produces an empty or error file — that means
  `/openapi.json` is not serving a valid spec, which is an API-side problem and
  out of this plan's scope.
- The TanStack Start SSR-query integration API does not match what the loaded
  `start-core` skill describes. Do not invent provider wiring from memory.
- You conclude the response envelope cannot be typed generically through
  `openapi-fetch`. Report the specific type error; do not fall back to `any`.
- Browser requests fail CORS after step 2. Re-read the CORS trap section; if it
  still fails, report the exact response headers rather than loosening the
  API's CORS policy.
- You find yourself editing anything under `apps/api/src/`.

## Maintenance notes

- **For the reviewer**: the decision record in "The client decision" is the
  most important part of this change. If a future contributor proposes
  `hc<typeof app>`, the two code facts that rule it out are
  `context-middleware.ts:13` (`ok` returns `Response`, not `TypedResponse`) and
  `validate-json-middleware.ts:10` (custom middleware, invisible to RPC
  inference). Keep that reasoning in `apps/web/AGENTS.md`.
- **Regeneration discipline**: `api-types.d.ts` drifts silently when an API
  route changes. A CI step that regenerates against a booted API and fails on a
  diff is the durable fix — worth doing once a build job exists
  (see the CI gap recorded in `plans/README.md`).
- **Deliberately deferred — session wiring.** This plan proves the seam on a
  *public* endpoint. Authenticated calls need more: `authClient` currently has
  no `useSession` call anywhere in `apps/web`, no session provider, no
  `beforeLoad` guard, and post-auth `callbackURL` is `"/"`
  (`apps/web/src/components/auth/use-auth-form.ts:18`). On SSR the session
  cookie must be forwarded explicitly — `credentials: "include"` only covers
  the browser. Whoever builds the first `/users/me/*` screen owns that.
- **Deliberately deferred — i18n on data routes.** `project.inlang/settings.json`
  declares `locales: ["en"]` with a cookie-based strategy and no URL locale
  segment, and `__root.tsx:36` hard-codes `lang="en"`. The README advertises
  Portuguese and French. Adding a locale today has no route or middleware to
  select it; that is its own piece of work.
- **Watch**: `POST /medias/search` is rate-limited to 60/min per client
  (`search-medias-handler.ts:112`). `defaultPreload: "intent"` in
  `router.tsx` will fire loaders on hover — make sure query `staleTime` is set
  high enough that hovering a grid does not burn the budget.
