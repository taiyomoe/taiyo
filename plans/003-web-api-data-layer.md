# Plan 003: Make Hono RPC work end to end, and wire it into `apps/web`

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 458557fb..HEAD -- apps/web apps/api/src/index.ts apps/api/src/middlewares apps/api/src/utils/errors.ts`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

> **Repo convention — no source comments.** This repo is moving to a
> comment-free source tree: rationale lives in docs, not in `//` lines. See
> `plans/006-comment-free-codebase.md`, whose steps 1–3 harvest existing
> comments into `packages/ui/STYLEX.md`, `docs/engineering-notes.md` and
> `apps/web/AGENTS.md`. **Do not add explanatory comments to source files in
> this plan.** Where this plan needs a "why" recorded, it says which doc to
> write it to. If `docs/engineering-notes.md` does not exist yet (plan 006 has
> not run), create it with a single `# Engineering notes` heading and add your
> section under it.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED
- **Depends on**: none (plans 001/002 make the proven route render images)
- **Category**: direction
- **Planned at**: commit `458557fb`, 2026-09-21
- **Revised**: 2026-09-21 — the maintainer chose Hono RPC over an
  OpenAPI-generated client and asked for whatever API-side type changes that
  requires. This plan now makes RPC work rather than routing around it.

## Why this matters

`apps/api` mounts 9 routers over 74 handlers — a complete reading-platform API
with search, chapters, library, history, lists, follows and group ownership,
all integration-tested. **It has no consumer.** `apps/web` contains zero
`fetch`, zero `createServerFn`, zero `useQuery`, zero `hc()`. There is no API
base URL in `apps/web/.env.example` and no query client in
`apps/web/package.json`.

Every remaining frontend feature is blocked on this seam. This plan builds it
once, deliberately, and proves it end to end on a single route.

## What blocks RPC today, and how each block is removed

Hono's `hc<AppType>()` derives request and response types from the app's
`Schema`, which is built from two things: the `Input` generic of each
middleware in a route's chain, and the `TypedResponse` returned by its
handlers. This repo currently supplies neither. Both are fixable in two files,
and the fixes are purely type-level — **no runtime behavior changes**.

**Block 1 — `ok` and `fail` are declared to return a bare `Response`.**
`apps/api/src/middlewares/context-middleware.ts:12-15`:

```ts
export type AppContext = {
  ok: <T>(data: T, meta?: Record<string, unknown>) => Response
  fail: (errorCode: ErrorCode, details?: unknown) => Response
}
```

The _implementations_ already do the right thing — both call `c.json(...)`,
which returns a `TypedResponse` at runtime and in type. Only the declared
signature throws the information away. Because every one of the 74 handlers
returns `c.ok(...)` / `c.fail(...)`, every route currently infers as
`Response`, and `hc` would give you nothing. Step 1 fixes the declaration.

**Block 2 — the `validate-*` middlewares declare no `Input`.**
`apps/api/src/middlewares/validate-json-middleware.ts:10-12` uses
`createMiddleware<Env<TSchema>>(...)`, supplying only the `Env` generic. The
installed `hono@4.13.2` signature is:

```ts
declare const createMiddleware: <
  E extends Env = any,
  P extends string = string,
  I extends Input = {},
  R extends HandlerResponse<any> | void = void,
>(
  middleware: MiddlewareHandler<E, P, I, R extends void ? Response : R>,
) => MiddlewareHandler<E, P, I, R extends void ? Response : R>
```

— the third generic `I extends Input` is exactly the hook `hc` reads request
types from. It is simply not being passed. This is the same mechanism
`@hono/zod-validator` uses. Step 2 fills it in.

Two facts that make this safe, both verified against
`node_modules/.pnpm/hono@4.13.2/node_modules/hono/dist/types/types.d.ts`:

- `ValidationTargets.json` is typed `any` (line 540), so a Zod input type can
  be declared for JSON bodies without fighting a constraint.
- `ValidationTargets.query` is `Record<string, string | string[]>` (line 542),
  which a coercing schema's `z.input` will generally _not_ satisfy. Step 2
  handles query and param deliberately, and the trade-off is stated there.

**Block 3 — no exported app type.** `apps/api/package.json` exports `"."` →
`./src/index.ts`, but `index.ts` also contains the `serve()` bootstrap. Step 3
splits the app factory out so `apps/web` can import a type without pulling a
server-starting module into its graph.

**Non-blocks, checked so you do not worry about them:**

- _Handler arity._ Hono's overloads accept a path plus up to 10 handlers
  (`H<E11, MergedPath, I10, R>` is the last overload). The heaviest route here
  is `create-covers-handler.ts` with 7 middlewares + handler. Within budget.
- _`.route("/", subApp)` composition._ Each handler file already exports a
  chained `new Hono().get(...)` instance, and routers chain `.route(...)`, so
  schemas merge as Hono expects. No restructuring needed.
- _`strict: true`_ is set in `tooling/typescript/base.json` — Hono RPC requires
  it.

## Current state

### `apps/api/src/middlewares/context-middleware.ts:41-52` — the `ok` implementation

```ts
c.ok = <T>(data: T, meta?: Record<string, unknown>) => {
  c.status(c.req.method === "POST" ? 201 : 200)

  return c.json({
    success: true,
    data,
    ...(meta !== undefined ? { meta } : {}),
    timestamp,
    requestId,
  })
}
```

Status is 201 for POST and 200 otherwise — chosen at runtime, so the type must
admit `200 | 201`.

### `apps/api/src/utils/errors.ts:218-238`

```ts
export const errors = {
  // …merged per-resource error maps, each `as const`
} as const

export type ErrorCode = keyof typeof errors
```

Every entry is `{ message: string; code: number }` under `as const`, so
`(typeof errors)[C]["code"]` resolves to a **literal** status (`404`, `409`, …).
That is what makes precisely-typed error responses possible in step 1.

### `apps/api/src/middlewares/validate-json-middleware.ts` (the whole file)

```ts
import { createMiddleware } from "hono/factory"
import type z from "zod"

type Env<TSchema extends z.ZodType> = {
  Variables: {
    json: z.infer<TSchema>
  }
}

export const validateJson = <TSchema extends z.ZodType>(schema: TSchema) => {
  return createMiddleware<Env<TSchema>>(async (c, next) => {
    let raw: unknown

    try {
      raw = await c.req.json()
    } catch {
      raw = {}
    }

    const validation = schema.safeParse(raw)

    if (!validation.success) {
      return c.fail("VALIDATION_ERROR", validation.error.issues)
    }

    c.set("json", validation.data)

    await next()
  })
}
```

`validate-query-middleware.ts`, `validate-param-middleware.ts` and
`validate-form-data-middleware.ts` follow the identical shape — read all four
before editing.

### `apps/api/src/index.ts:39,169-175` — the app factory and the bootstrap

```ts
export const createApp = (services: Services) => {
  const app = new Hono()
    // …middleware and 9 `.route(...)` calls
  app.get("/openapi.json", …).get("/docs", …)
  return app
}

if (!process.env.TEST) {
  const app = createApp(createServices())

  serve({ fetch: app.fetch, port: 3002 }, ({ port }) => {
    console.debug(`Server is running on http://localhost:${port}`)
  })
}
```

Note the second chain (`/openapi.json`, `/docs`) is not assigned back to
`app`, so those two routes are absent from the inferred schema. That is fine —
the client does not need them.

`apps/api/src/__integration-tests__/setup.ts:17` imports `createApp` from
`../index`. Step 3 changes that import.

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

`createRootRoute` (not `createRootRouteWithContext`) and **no providers of any
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

Match its JSDoc-comment style when extending it.

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
`http://localhost:3000` to the API on `:3002` fail until this is set. Step 4
handles it.

### The endpoint you will prove against

`POST /medias/search` (`apps/api/src/handlers/search-medias-handler.ts:77`) —
public, rate-limited 60/60s, returns
`apiSuccessEnvelope(mediaHitSchema.array(), paginationMetaSchema)`. It is a
**POST that performs a read**, because the filter/sort payload is too large for
a query string. The request body is therefore part of the cache key.

## Commands you will need

| Purpose             | Command                                                          | Expected on success |
| ------------------- | ---------------------------------------------------------------- | ------------------- |
| Install             | `pnpm install`                                                   | exit 0              |
| Lint + typecheck    | `pnpm lint`                                                      | exit 0              |
| Format check / fix  | `pnpm format` / `pnpm format:fix`                                | exit 0              |
| Workspace dep check | `pnpm lint:ws`                                                   | exit 0              |
| Dead code check     | `pnpm knip`                                                      | exit 0              |
| Start infra         | `docker compose up -d`                                           | services healthy    |
| Migrate + seed      | `pnpm -F db kysely migrate latest && pnpm -F db kysely seed run` | exit 0              |
| Run API             | `pnpm -F api dev`                                                | listening on :3002  |
| Run web             | `pnpm -F web dev`                                                | listening on :3000  |
| Build web           | `pnpm -F web build`                                              | exit 0              |
| Unit tests          | `pnpm test:unit`                                                 | all pass            |
| Integration tests   | `pnpm test:integration`                                          | all pass            |

`pnpm lint` is the type gate — oxlint with `typeAware: true` and
`typeCheck: true`. There is no separate `tsc --noEmit`.

## Scope

**In scope**:

- `apps/api/src/middlewares/context-middleware.ts`
- `apps/api/src/middlewares/validate-json-middleware.ts`
- `apps/api/src/middlewares/validate-query-middleware.ts`
- `apps/api/src/middlewares/validate-param-middleware.ts`
- `apps/api/src/app.ts` (create — the moved factory)
- `apps/api/src/index.ts` (reduced to the bootstrap)
- `apps/api/src/__integration-tests__/setup.ts` (import path only)
- `apps/api/package.json` (one export-map entry)
- `apps/api/.env.example` (the CORS line only)
- `apps/web/package.json`
- `apps/web/.env.example`
- `apps/web/src/env/client.ts`
- `apps/web/src/lib/api.ts` (create)
- `apps/web/src/router.tsx`
- `apps/web/src/routes/__root.tsx`
- `apps/web/src/routes/titles.tsx` (create — the proving route)
- `apps/web/AGENTS.md`
- `turbo.json` (`globalEnv` entry for `VITE_API_URL`)
- `docs/engineering-notes.md` (create or append — the rationale from steps 1–2)

**Out of scope** (do NOT touch):

- **Any of the 74 handler files.** The whole point of steps 1–2 is that the
  handlers need no edits. If you find yourself changing one, stop.
- `apps/api/src/middlewares/validate-form-data-middleware.ts` — multipart
  request typing over RPC is awkward (nested arrays containing `File`s do not
  fit `ValidationTargets.form`). It keeps working at runtime and stays
  untyped on the client. Step 2 explains.
- `apps/api/src/utils/errors.ts` — read it, do not edit it.
- `apps/web/src/routeTree.gen.ts` — generated. It regenerates when you add a
  route; commit the result, never hand-edit it.
- `apps/web/src/components/landing/**`, `.../auth/**`, `.../scene/**`,
  `apps/web/src/routes/{index,terms,privacy,dmca}.tsx`.
- `packages/auth` — session wiring is deliberately deferred; see Maintenance.
- StyleX theming, tokens, or anything under `packages/ui`.

## Git workflow

- Branch: `advisor/003-web-api-data-layer` off `rewrite`.
- Conventional Commits. Commit steps 1–3 (API typing) separately from steps
  4–8 (web wiring) — the API half is independently reviewable and independently
  revertible.
  Suggested: `refactor(api): return typed responses so hono rpc can infer`,
  then `feat(web): wire the hono rpc client and query layer`.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Make `ok` and `fail` return `TypedResponse`

Edit `apps/api/src/middlewares/context-middleware.ts`. **Type-level only — do
not change what the functions do at runtime.**

Add the envelope types and rewrite `AppContext`:

```ts
import type { TypedResponse } from "hono"
import { type ErrorCode, errors } from "../utils/errors"

export type SuccessEnvelope<T> = {
  success: true
  data: T
  timestamp: string
  requestId: string
}

export type PaginatedEnvelope<T, M> = SuccessEnvelope<T> & { meta: M }

export type ErrorEnvelope<C extends ErrorCode = ErrorCode> = {
  success: false
  code: C
  message: string
  timestamp: string
  requestId: string
  details?: unknown
}

/** The literal HTTP status a given error code responds with. */
type ErrorStatus<C extends ErrorCode> = (typeof errors)[C]["code"]

export type AppContext = {
  ok: {
    <T>(data: T): TypedResponse<SuccessEnvelope<T>, 200 | 201, "json">
    <T, M extends Record<string, unknown>>(
      data: T,
      meta: M,
    ): TypedResponse<PaginatedEnvelope<T, M>, 200 | 201, "json">
  }
  fail: <C extends ErrorCode>(
    errorCode: C,
    details?: unknown,
  ) => TypedResponse<ErrorEnvelope<C>, ErrorStatus<C>, "json">
}
```

`200 | 201` is required because the implementation picks the status from the
request method at runtime (`c.status(c.req.method === "POST" ? 201 : 200)`).
`ErrorStatus<C>` resolves to a literal because `errors` is declared `as const`.

The implementations stay byte-identical except that the assignments now need a
cast — an overloaded signature cannot be satisfied by an arrow function
expression:

```ts
c.ok = ((data: unknown, meta?: Record<string, unknown>) => {
  c.status(c.req.method === "POST" ? 201 : 200)

  return c.json({
    success: true,
    data,
    ...(meta !== undefined ? { meta } : {}),
    timestamp,
    requestId,
  })
}) as AppContext["ok"]
```

Apply the analogous `as AppContext["fail"]` to the `fail` assignment. Leave the
body of `fail` exactly as it is.

Record the _why_ in `docs/engineering-notes.md`, not in a source comment (see
the repo convention above): a short section explaining that `ok` and `fail`
must keep returning `TypedResponse`, because `apps/web`'s RPC client silently
degrades to `any` if they do not, and nothing in `apps/api`'s own test suite
will fail when that happens.

**Verify**: `pnpm lint` → exit 0; `pnpm test:integration` → all pass. The
integration suite is the proof that runtime behavior is unchanged; **do not
skip it on this step.**

### Step 2: Give the validators an `Input` generic

Edit `validate-json-middleware.ts`, `validate-query-middleware.ts` and
`validate-param-middleware.ts`. Again: type-level only.

For **JSON** — `ValidationTargets.json` is `any`, so the schema's input type
can be declared directly:

```ts
export const validateJson = <TSchema extends z.ZodType>(schema: TSchema) => {
  return createMiddleware<
    { Variables: { json: z.output<TSchema> } },
    string,
    { in: { json: z.input<TSchema> }; out: { json: z.output<TSchema> } }
  >(async (c, next) => {
    // …body unchanged
  })
}
```

For **query** and **param**, declare the `in` side with Hono's own target
types rather than `z.input`:

```ts
    { in: { query: Record<string, string | string[]> }; out: { query: z.output<TSchema> } }
```

```ts
    { in: { param: Record<string, string> }; out: { param: z.output<TSchema> } }
```

**This is a deliberate trade-off, not laziness.** `ValidationTargets.query` is
`Record<string, string | string[]>`, and these schemas coerce (`page` and
`perPage` arrive as strings and parse to numbers), so `z.input` would not
satisfy the constraint and the build would fail. The consequence: on the
client you get full typing of _responses_ and of JSON _bodies_, but query-string
keys stay loosely typed. That is the 90% of the value for 10% of the fight.
Record this trade-off in `docs/engineering-notes.md` alongside the `ok`/`fail`
note from step 1 — not in a source comment.

Leave `validate-form-data-middleware.ts` untouched — see Scope.

**Verify**: `pnpm lint` → exit 0; `pnpm test:integration` → all pass.

### Step 3: Split the app factory out and export its type

Create `apps/api/src/app.ts` containing everything `index.ts` currently has
**except** the trailing `if (!process.env.TEST) { … serve(…) }` block. That
means: the `declare module "hono"` augmentations, `corsOrigins`, `createApp`,
and all imports it needs.

At the end of `app.ts`, add:

```ts
/**
 * The shape of the whole API, for `hc<AppType>()` in `apps/web`.
 *
 * Import this with `import type` only — never as a value.
 */
export type AppType = ReturnType<typeof createApp>
```

Reduce `apps/api/src/index.ts` to the bootstrap: import `createApp` from
`./app`, import `createServices` from `./services`, keep the
`if (!process.env.TEST)` guard and the `serve(...)` call, and re-export
`createApp` and `AppType` so nothing else breaks.

Update `apps/api/src/__integration-tests__/setup.ts:17` to import `createApp`
from `../app`.

Add an export-map entry to `apps/api/package.json`:

```json
    "./app": "./src/app.ts",
```

alongside the existing `"."` and `"./env"` entries.

**Why the split matters**: `apps/web` will `import type { AppType } from
"@taiyomoe/api/app"`. Importing from `"."` would put a module containing a
live `serve()` call into web's module graph. `import type` is erased (the web
app sets `verbatimModuleSyntax: false` — see `apps/web/AGENTS.md` decision 3),
so it would probably be harmless, but "probably harmless" is not a foundation.

**Verify**: `pnpm lint` → exit 0; `pnpm test:integration` → all pass;
`pnpm -F api dev` still starts and serves `/ping`.

### Step 4: Add web dependencies and configuration

From the repo root (never `npm`/`yarn`):

```bash
pnpm -F web add hono @tanstack/react-query @tanstack/react-router-ssr-query
pnpm -F web add -D @taiyomoe/api@workspace:^
```

`hono` is a real runtime dependency (`hc` ships in `hono/client`).
`@taiyomoe/api` is a **devDependency** because it is consumed for types only.

Then `pnpm lint:ws` — sherif enforces matching shared dependency versions
across workspace packages. If it reports a mismatch on `hono` or `@tanstack/*`,
align to the version already in the workspace rather than upgrading the other
package.

In `apps/web/.env.example`:

```dotenv
# API
VITE_API_URL="http://localhost:3002"
```

In `apps/web/src/env/client.ts`, add to `client`, matching the existing JSDoc
style:

```ts
    /** Base URL of the Taiyō API. No trailing slash. */
    VITE_API_URL: z.url(),
```

In `apps/api/.env.example`, make local development work:

```dotenv
CORS_ALLOWED_ORIGINS="http://localhost:3000"
```

Add `"VITE_API_URL"` to `turbo.json`'s `globalEnv` array.

**Verify**: `pnpm install` → 0; `pnpm lint:ws` → 0;
`grep -n "VITE_API_URL" apps/web/.env.example apps/web/src/env/client.ts turbo.json`
→ one match per file.

### Step 5: Create the RPC client and the envelope helper

Create `apps/web/src/lib/api.ts`:

```ts
import { hc } from "hono/client"
import type { AppType } from "@taiyomoe/api/app"
import { env } from "@/env/client"

/**
 * Typed RPC client for the Taiyō API.
 *
 * `credentials: "include"` forwards the Better Auth session cookie; the API
 * only honours it for origins listed in its `CORS_ALLOWED_ORIGINS`.
 */
export const api = hc<AppType>(env.VITE_API_URL, {
  init: { credentials: "include" },
})
```

The `@/*` alias already resolves to `apps/web/src/*` — see `apps/web/AGENTS.md`
("Key architectural decisions", item 2) and the StyleX `aliases` entry in
`apps/web/vite.config.ts`. Use it; do not add a new alias.

Then add an `unwrap` helper in the same file. Every response is an envelope:
success is `{ success: true, data, timestamp, requestId }` (plus `meta` on
paginated routes) and failure is `{ success: false, code, message, … }`. The
helper takes the `await res.json()` union, returns `data` on success, and
throws an error carrying `code` on failure, so route loaders do not each
reimplement the narrowing. Give the thrown error a named class
(`ApiError`) exposing `code` and `message`, so `errorComponent` can render
the API's own error code.

**Verify**: `pnpm lint` → exit 0.

### Step 6: Confirm the types actually flow — do this before building any UI

This is the load-bearing checkpoint of the plan. In a scratch file
(`apps/web/src/lib/__rpc-check.ts`, deleted at the end of this step), write:

```ts
import { api } from "./api"

const res = await api.medias.search.$post({ json: { page: 1, perPage: 20 } })
const body = await res.json()
```

Then check three things:

1. `body` is **not** `any` and **not** `unknown`. Hover it / use
   `pnpm lint` with a deliberate error to surface the inferred type — e.g. add
   `const x: number = body` and confirm the error message names the envelope
   union, not `any`.
2. The success branch's `data` is an array of media hits with real fields
   (`id`, `type`, `status`, `mainTitle`, …), not `unknown`.
3. The `json` argument is type-checked — passing `{ page: "nonsense" }` must
   be a type error.

If any of the three fails, **STOP and report which one**. Everything after this
step assumes RPC inference works, and building UI on top of silently-`any`
types is worse than not shipping it.

Delete the scratch file once all three pass, then run `pnpm knip` to confirm
nothing dangles.

**Verify**: all three checks pass; scratch file removed; `pnpm lint` → 0.

### Step 7: Measure the typecheck cost

Hono's own documentation warns that RPC type inference gets expensive on large
apps, and this app has 74 routes whose handlers return unions of `ok` and
`fail` responses.

Record `pnpm lint` wall-clock time before your changes (from the branch point)
and after. State both numbers in your report.

If the after-time is more than roughly double the before-time, **do not
improvise a fix** — report it. The documented remedy is to pre-compile the
client types into a `.d.ts` and have `apps/web` consume that instead of
inferring from source, which is a real but separate piece of work.

**Verify**: both timings recorded in your report.

### Step 8: Wire the query client into the router

Rewrite `apps/web/src/router.tsx` to create a `QueryClient`, pass it as router
`context`, and register it via `setupRouterSsrQueryIntegration` from
`@tanstack/react-router-ssr-query` so server-fetched data dehydrates into the
client.

**Read the TanStack Start guidance before writing this.** `apps/web/AGENTS.md`
instructs: run `npx @tanstack/intent@latest list` and
`npx @tanstack/intent@latest load @tanstack/start-client-core#start-core`, then
follow the returned `SKILL.md`. Do that — this is the one step where guessing
the API shape will cost you.

Change `createRootRoute` to
`createRootRouteWithContext<{ queryClient: QueryClient }>()` in
`apps/web/src/routes/__root.tsx`, and wrap `{children}` in `QueryClientProvider`
inside `RootDocument`. Add the React Query devtools panel to the existing
`TanStackDevtools` `plugins` array, matching the existing object shape.

Do not restructure the `<html>`/`<head>`/`<body>` markup and do not touch
`darkModeClassName` (`__root.tsx:11`).

Set a non-zero `staleTime` on the QueryClient's defaults. `router.tsx` sets
`defaultPreload: "intent"`, which fires loaders on hover; `POST /medias/search`
is rate-limited to 60/min (`search-medias-handler.ts:112`), and a grid of
hoverable cards will burn that budget otherwise.

**Verify**: `pnpm lint` → 0; `pnpm -F web dev` starts with the landing page
unchanged; `pnpm -F web build` → 0.

### Step 9: Prove it on one route

Create `apps/web/src/routes/titles.tsx`: a route whose `loader` calls
`api.medias.search.$post(...)` with an empty query (browse mode) and renders
the resulting media hits as a plain list — **title text only**. No grid, no
cover images, no filters, no styling ambition. This route exists to prove the
seam; plan 005 replaces it with the real surface.

It must demonstrate all four of:

1. SSR — the list is in the initial HTML.
   Verify: `curl -s http://localhost:3000/titles | grep -c "<li"` → > 0.
2. Hydration without refetch — devtools show the query already populated.
3. `errorComponent` — renders the `ApiError`'s `code` when the call fails.
4. `pendingComponent` — a loading state.

Use `@taiyomoe/ui` components for anything visual, imported by path (there is
no barrel): `import { Spinner } from "@taiyomoe/ui/components/ui/spinner"`.
Styling goes through StyleX `stylex.create` only — this repo has no
utility-class framework.

Add the route's user-visible strings to `apps/web/messages/en.json` and read
them via `import { m } from "@/paraglide/messages"`, matching
`apps/web/src/routes/index.tsx:13`. Do not hardcode English in JSX.

**Verify**: with infra + API + web running:

- `curl -s http://localhost:3000/titles | grep -c "<li"` → > 0
- Stop the API, reload `/titles` → the `errorComponent` renders; the page does
  not blank out or throw unhandled.

### Step 10: Update the app's own documentation

`apps/web/AGENTS.md` is now materially wrong. Fix exactly these claims:

- The opening description calls it "a **blank TanStack Start (React)** app …
  No partner add-ons, no feature scaffolding". It has a landing page, auth
  forms, three legal routes and now a data layer.
- "**Environment variables** — **None.**" It has four
  (`VITE_BETTER_AUTH_URL`, `VITE_TURNSTILE_SITE_KEY`, `VITE_SUPPORT_EMAIL`,
  and now `VITE_API_URL`).
- The "Dropped unused deps" bullet lists `@tanstack/react-router-ssr-query` as
  deliberately removed for having no QueryClient. Record that this plan
  re-added it and why.

Add a short "Data layer" section: the client lives in `src/lib/api.ts`, it is
Hono RPC over `@taiyomoe/api/app`'s `AppType`, responses come back as an
envelope union and go through `unwrap`, and **the API's `ok`/`fail` must keep
returning `TypedResponse` or all of this silently degrades to `any`**.

**Verify**: `grep -n "None\." apps/web/AGENTS.md` no longer matches the
environment-variables section.

### Step 11: Full gate

**Verify**: `pnpm format` → 0; `pnpm lint` → 0; `pnpm lint:ws` → 0;
`pnpm knip` → 0; `pnpm test:unit` → pass; `pnpm test:integration` → pass;
`pnpm -F web build` → 0.

## Test plan

Vitest runs from the root (`vitest.config.unit.ts` globs `**/__tests__/**`);
`apps/web` deliberately defines no local test script. Do not add one.

- **Existing integration suite is the regression gate for steps 1–3.** Those
  steps are type-only; if any of the 17 suites under
  `apps/api/src/__integration-tests__/` changes behavior, you changed runtime
  code by mistake. Run the full suite after each of steps 1, 2 and 3 — not
  just at the end.
- **New unit test**: `apps/web/src/lib/__tests__/api.test.ts` covering
  `unwrap` — success returns `data`, a `success: false` body throws an
  `ApiError` carrying `code`, and `meta` is preserved on paginated envelopes.
  Mock the response object; do not hit a real API.
- **Structural pattern**: `packages/utils/src/__tests__/extension-for-mime-type.test.ts`.
- **Not unit-tested**: RPC type inference (step 6 is a compile-time check, and
  the three assertions there _are_ the test), SSR, and hydration. Report the
  step 6 and step 9 results explicitly.
- **Verification**: `pnpm test:unit` and `pnpm test:integration` → all pass.

## Done criteria

ALL must hold:

- [ ] `pnpm lint` exits 0
- [ ] `pnpm format` exits 0
- [ ] `pnpm lint:ws` exits 0
- [ ] `pnpm knip` exits 0
- [ ] `pnpm test:unit` exits 0, including the new `api.test.ts`
- [ ] `pnpm test:integration` exits 0 — **unchanged from before this plan**
- [ ] `pnpm -F web build` exits 0
- [ ] Step 6's three inference checks all passed (state them in your report)
- [ ] `curl -s http://localhost:3000/titles | grep -c "<li"` returns > 0 with
      infra, API and web running
- [ ] `grep -rn "TypedResponse" apps/api/src/middlewares/context-middleware.ts`
      returns matches for both `ok` and `fail`
- [ ] `grep -rn "in: {" apps/api/src/middlewares/validate-{json,query,param}-middleware.ts`
      returns one match per file
- [ ] `grep -rn "@taiyomoe/api" apps/web/src` shows only `import type` usage
- [ ] `git diff --name-only` includes **no** file under `apps/api/src/handlers/`
- [ ] `apps/web/src/lib/__rpc-check.ts` does not exist
- [ ] `plans/README.md` status row for 003 updated

## STOP conditions

Stop and report back (do not improvise) if:

- **Step 6 fails.** If `body` infers as `any`/`unknown`, or the `json` argument
  is unchecked, the premise is broken. Report exactly which of the three checks
  failed and what the inferred type was. Do not paper over it with a manual
  type assertion — an `as` cast here would give you a client that _looks_
  typed and silently lies.
- `pnpm test:integration` changes behavior after step 1, 2 or 3. Those steps
  must be type-only.
- The overload-plus-cast approach in step 1 does not compile. Report the exact
  error rather than falling back to `Response`.
- `pnpm lint` time more than doubles (step 7).
- A route's handler chain exceeds Hono's 10-handler overload limit and
  inference collapses to `any` for that route. Report which route.
- The TanStack Start SSR-query integration API does not match what the loaded
  `start-core` skill describes. Do not invent provider wiring from memory.
- Browser requests fail CORS after step 4. Re-read the CORS trap section; if it
  still fails, report the exact response headers rather than loosening the
  API's CORS policy.
- You find yourself editing a file under `apps/api/src/handlers/`.

## Maintenance notes

- **For the reviewer**: the `TypedResponse` signatures in
  `context-middleware.ts` and the `Input` generics in the three validators are
  load-bearing _for the web app_, and nothing in `apps/api`'s own tests will
  fail if someone simplifies them back to `Response` or drops the third
  generic. The client would just quietly become `any`. This is the single
  highest-value thing to guard in review; the `docs/engineering-notes.md`
  section written in steps 1–2 exists for that reason.
- **Follow-up worth doing**: a tiny type-level regression test in
  `apps/web` — a file asserting that a known route's inferred response is not
  `any` — would turn that silent failure into a red build. `expectTypeOf` from
  Vitest is the natural tool. Deliberately out of scope here.
- **Known limitation**: query-string and path params are typed loosely on the
  client (`Record<string, string | string[]>`) because coercing Zod schemas
  cannot satisfy `ValidationTargets.query`. JSON bodies and all responses are
  fully typed. If this becomes painful, the fix is to split each query schema
  into a string-shaped input schema plus a coercion step.
- **Known limitation**: multipart endpoints (cover/banner/staff upload,
  chapter page sessions) have untyped request bodies because
  `validate-form-data-middleware.ts` was left alone. They work at runtime. The
  admin surfaces that need them do not exist yet.
- **Deliberately deferred — session wiring.** This plan proves the seam on a
  _public_ endpoint. `authClient` has no `useSession` call anywhere in
  `apps/web`, no session provider, no `beforeLoad` guard, and post-auth
  `callbackURL` is `"/"` (`apps/web/src/components/auth/use-auth-form.ts:18`).
  On SSR the session cookie must be forwarded explicitly —
  `credentials: "include"` only covers the browser. Whoever builds the first
  `/users/me/*` screen owns that.
- **Deliberately deferred — i18n on data routes.** `project.inlang/settings.json`
  declares `locales: ["en"]` with a cookie strategy and no URL locale segment,
  and `__root.tsx:36` hard-codes `lang="en"`, while the README advertises
  Portuguese and French. Its own piece of work.
