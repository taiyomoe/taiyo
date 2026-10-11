<!-- intent-skills:start -->

## Skill Loading

Before substantial work:

- Skill check: run `npx @tanstack/intent@latest list`, or use skills already listed in context.
- Skill guidance: if one local skill clearly matches the task, run `npx @tanstack/intent@latest load <package>#<skill>` and follow the returned `SKILL.md`.
- Monorepos: when working across packages, run the skill check from the workspace root and prefer the local skill for the package being changed.
- Multiple matches: prefer the most specific local skill for the package or concern you are changing; load additional skills only when the task spans multiple packages or concerns.

<!-- intent-skills:end -->

# @taiyomoe/web — Project Context

A **TanStack Start (React)** app scaffolded with the TanStack CLI and merged into
the `taiyo` pnpm monorepo as a workspace app under `apps/`. It started as a blank
starter; it now ships a landing page, two auth forms, three legal routes, and a
data layer that talks to `apps/api` over Hono RPC. No partner CLI add-ons were
selected — everything beyond the starter was added by hand.

## Scaffold provenance

The host repo is an existing pnpm monorepo, not an empty directory, so the CLI was
run in a throwaway scratch directory and its output was merged in here.

- **Exact CLI command (as requested):**
  `npx @tanstack/cli@latest create my-tanstack-app --agent`
  - `--agent` runs non-interactively and auto-wires TanStack Intent. It resolved to
    `@tanstack/cli@0.69.3` and defaulted to `framework: react`,
    `includeExamples: true`, `chosenAddOns: []`, no toolchain (no Biome/ESLint).
    Its CSS-framework default was later removed outright — see **Styling** below.
- **Re-run for a truly blank app:** the command above defaulted to
  `includeExamples: true`, which emits demo pages + themed `Header`/`Footer`/
  `ThemeToggle` components — i.e. feature scaffolding. To honor the "blank starter,
  no feature scaffolding" requirement, the merged code comes from a re-run with
  `--no-examples` (and `--no-git`, since the repo is already a git repo):
  `npx @tanstack/cli@latest create blank-app --agent --no-examples --no-git`
- **Renamed to `web`:** the CLI commands above used the requested name
  `my-tanstack-app`; the merged app was then renamed to `apps/web` /
  `@taiyomoe/web`.
- **Follow-up TanStack Intent commands (run after scaffolding):**
  - `npx @tanstack/intent@latest install` → wrote the `intent-skills` block at the
    top of this file (resolved to `@tanstack/intent@0.1.1`).
  - `npx @tanstack/intent@latest list` → catalogs the skills shipped by the
    installed TanStack packages.
  - `npx @tanstack/intent@latest load <package>#<skill>` → loads a specific
    `SKILL.md` (e.g. `@tanstack/start-client-core#start-core`). **Load the relevant
    skill before architectural or library-specific changes — don't guess.**

## Stack & integrations

- **Framework:** TanStack Start (React) — SSR + file-based routing via TanStack Router.
- **Build:** Vite 8 with the `tanstackStart()` plugin (must precede `viteReact()`).
- **Styling:** StyleX via `@stylexjs/unplugin`, and nothing else — the repo has no
  utility-class framework. Components style themselves with `stylex.create`, read
  tokens from `@taiyomoe/ui/styles/tokens.stylex`, and accept caller overrides
  through an `sx` prop. `src/styles.css` is reserved for what StyleX cannot own:
  global `@keyframes` the scene animations share, and the handful of descendant
  rules that reach into `@taiyomoe/ui`'s internals (see `[data-auth-fields]`).
  The brand-scene palette — always night, in both themes — lives in
  `src/components/scene/scene.stylex.ts`, deliberately outside the semantic tokens.
- **Devtools:** `@tanstack/react-devtools` + router devtools panel + `@tanstack/devtools-vite`.
- **Routing:** `src/routes/*` → `src/routeTree.gen.ts` (generated; committed).
- **Toolchain:** kept the CLI default (no Biome/ESLint). Lint/format are handled at
  the workspace root by **oxlint** (`pnpm lint:fix`) and **oxfmt** (`pnpm format:fix`,
  `semi: false`, `sortPackageJson: true`). Tests run from the root via
  `vitest.config.unit.ts` (globs `**/__tests__/**`), so this app defines no local
  test script — matching `apps/api` and `apps/storybook`.

## Environment variables

Four, all client-side and all validated in `src/env/client.ts` (`@t3-oss/env-core`,
`clientPrefix: "VITE_"`). See `.env.example`:

| Variable                  | Source                      | Purpose                                       |
| ------------------------- | --------------------------- | --------------------------------------------- |
| `VITE_BETTER_AUTH_URL`    | `@taiyomoe/auth/env-client` | Where the Better Auth handler lives.          |
| `VITE_TURNSTILE_SITE_KEY` | `@taiyomoe/auth/env-client` | Turnstile widget key for auth forms.          |
| `VITE_SUPPORT_EMAIL`      | this app (defaulted)        | Contact address in legal copy.                |
| `VITE_API_URL`            | this app (required)         | Base URL of the Taiyō API, no trailing slash. |

Every key is registered in root `turbo.json` `globalEnv`; add new ones there too,
or Turbo's cache will not notice them. If you later add server functions that need
secrets, follow the `apps/api` pattern (`dotenv -e ../../.env --` via a `with-env`
script) rather than reading `process.env` directly.

## Deployment

No deployment adapter was selected (CLI default). TanStack Start builds via Nitro and
can target Cloudflare / Netlify / Vercel / Node. The monorepo itself uses Cloudflare
(`.wrangler/`), so Cloudflare Workers is the most likely target — but that is **not
configured here yet**. To add one: `load @tanstack/start-client-core#start-core/deployment`
and configure the Nitro preset. Default `vite build` + `vite preview` works locally.

## Key architectural decisions

1. **Monorepo merge, not a standalone repo.** Placed at `apps/web`, package name
   `@taiyomoe/web` (matches `@taiyomoe/api`, `@taiyomoe/storybook`). The standalone
   npm `package-lock.json` and the scratch `.git` were dropped; dependencies are
   managed by the root pnpm workspace. The CLI's standalone `.gitignore` and
   `README.md` were also dropped — build-artifact ignores live in the **root**
   `.gitignore` (`.tanstack`, `.nitro`, `.output`, `.vinxi`, `*.local`), and the app
   is documented in the **root** `README.md`.
2. **`tsconfig.json` extends `@taiyomoe/typescript/base.json`** (the shared base)
   instead of the CLI's standalone config, then layers on what Start needs: `jsx:
react-jsx`, DOM libs, `vite/client` types, and a single `@/*` path alias. The CLI
   also shipped a `#/*` alias (and a matching `package.json#imports` entry); both
   were removed in favor of `@/*` only.
3. **`verbatimModuleSyntax` forced to `false`.** The CLI's generated tsconfig set it
   to `true`, but the shipped `@tanstack/start-client-core#start-core` skill flags
   that as a HIGH-severity mistake ("causes server bundles to leak into client
   bundles. Keep it disabled"). Per the skill, it is disabled here. Revisit if a
   future CLI/skill version changes this guidance.
4. **Versions pinned & aligned with the workspace.** The CLI emitted several deps as
   `latest`; these were pinned to the resolved versions and aligned with the
   versions already used by `apps/storybook` / root (react 19.2.7, vite 8.0.16,
   typescript 6.0.3, @stylexjs/unplugin 0.19.0, etc.) so the `postinstall` **sherif**
   workspace check passes.

## Deviations from raw CLI output (and why)

- **Dropped unused deps** to satisfy the monorepo's `knip`/`sherif` tooling — none
  were imported by the blank starter: `lucide-react` (icons), the CSS framework's
  typography plugin, and the test stack (`vitest`, `@testing-library/*`, `jsdom`)
  plus the `test` script (root owns testing).
  - **`@tanstack/react-router-ssr-query` was dropped and has since been re-added.**
    It was removed because the blank starter had no `QueryClient` to integrate.
    The data layer introduced one, and `setupRouterSsrQueryIntegration` is what
    dehydrates server-fetched query data into the client cache — without it every
    SSR'd route would refetch on hydration. See **Data layer** below.
- **Dropped the app-level `pnpm.onlyBuiltDependencies` field** — build-script
  approvals are governed by the root `pnpm-workspace.yaml` `allowBuilds` in a workspace.

## Data layer

The app reads `apps/api` through **Hono RPC**, not `fetch` and not an
OpenAPI-generated client.

- **The client** is `src/lib/api.ts`: `hc<AppType>(env.VITE_API_URL, { init: {
credentials: "include" } })`, where `AppType` comes from
  `@taiyomoe/api/app`. `@taiyomoe/api` is a **devDependency** and must only ever
  be reached with `import type` — importing it as a value would pull a module
  containing a live `serve()` call into the client graph.
- **Every response is an envelope.** Success is `{ success: true, data, timestamp,
requestId }` plus `meta` on paginated routes; failure is `{ success: false,
code, message, … }`. `unwrap(res)` in the same file narrows that union, returns
  `data`, and throws an `ApiError` carrying the API's own `code` and HTTP
  `status` otherwise. Route loaders and query functions call `unwrap`; they do
  not narrow by hand.
- **`apps/api`'s `ok`/`fail` must keep returning `Response &
TypedResponse<…>`, and the validators must keep declaring their `Input`
  generic.** If either is simplified away, this whole client silently degrades to
  `any` and no test in the repo fails. The full rationale is in
  `docs/engineering-notes.md`.
- **Query options live in `src/lib/queries/`**, one `queryOptions` factory per
  endpoint, and are handed to routes through the route's `context` function —
  never duplicated between a loader and a component. See **Router, query and
  prefetching** below.
- **CORS.** The API only honours `credentials: "include"` for origins listed in
  its `CORS_ALLOWED_ORIGINS`, which `pnpm bootstrap` points at this checkout's
  web origin. A browser request that fails with no response headers at all is
  almost always this.

## Router, query and prefetching

`src/router.tsx` owns the wiring. The shape follows TanStack's own guidance
(<https://tkdodo.eu/blog/tan-stack-router-and-query> and
<https://tkdodo.eu/blog/reliable-query-prefetching-with-tanstack-router>):

- **One `QueryClient` per router instance**, created inside `getRouter()` and
  passed both to router `context` and to `QueryClientProvider` in `__root.tsx`.
  Two instances would mean two caches and no hydration. Creating it per-request
  rather than at module scope is what keeps one user's cache off another's SSR
  response.
- **`defaultPreloadStaleTime: 0`** turns off the router's own
  stale-while-revalidate cache. With TanStack Query in the picture there must be
  exactly one cache; the router's would shadow it.
- **A non-zero `staleTime`** on the QueryClient defaults is load-bearing, not
  taste. `defaultPreload: "intent"` fires loaders on hover, and
  `POST /medias/search` is rate-limited to 60 requests/minute — a grid of
  hoverable cards burns that budget in seconds with `staleTime: 0`.
- **`defaultPendingComponent` / `defaultErrorComponent`** are set globally so
  routes can be written for the success case only. Prefer extending those over
  adding per-route boundaries.
- **`setupRouterSsrQueryIntegration({ router, queryClient })`** dehydrates
  server-fetched query data and rehydrates it on the client.
- **Query options go in the route's `context` function, not inline in the
  loader.** `context` runs once per unique `params` + `loaderDeps` combination,
  so the loader and the component read the _same_ options object:

  ```tsx
  export const Route = createFileRoute("/titles")({
    validateSearch: …,
    loaderDeps: ({ search }) => ({ page: search.page }),
    context: ({ deps }) => ({ titlesQueryOptions: titlesQueryOptions(deps) }),
    loader: ({ context }) => context.queryClient.ensureQueryData(context.titlesQueryOptions),
    component: Titles,
  })
  ```

  Building the options twice — once in the loader, once in the component — is the
  bug this guards against: the two drift, the loader prefetches the wrong key,
  and the component re-suspends on a second request. Nothing type-checks that
  for you.

- **Always read data through `useSuspenseQuery` / `useQuery`, never through
  `Route.useLoaderData()` alone.** The loader only primes the cache. Without a
  hook subscription the query counts as inactive: no refetch on
  invalidation, no window-focus refetch, and it is eligible for garbage
  collection. Treat the loader as fire-and-forget — the page must still work if
  you delete it.
- **Loaders use `prefetchQuery` and do not `await`.** `ensureQueryData` would
  make the loader the thing that blocks and the thing that throws; an unawaited
  `prefetchQuery` primes the cache and swallows its own rejection, leaving
  `useSuspenseQuery` to own both loading and errors. Note that oxlint's
  `no-floating-promises` requires the explicit `void` operator on that call.
- **`retry: 1`, not the React Query default of 3.** With the default, a
  completely unreachable API sits on the pending component for ~10 seconds
  before the error boundary ever renders, because of the exponential backoff.
  One retry still absorbs a transient blip and surfaces a real outage in about
  two seconds.

### Two things about errors here that are not obvious

- **Detect API errors structurally, not with `instanceof`.** Use
  `getApiErrorCode(error)` from `src/lib/envelope.ts`. When a query fails
  _during SSR_, TanStack Start serialises the error to the client, which strips
  its prototype — so `error instanceof ApiError` is `false` in precisely the
  case you most want to render a useful message. `getApiErrorCode` checks
  `name === "ApiError"` plus a string `code`, which survives that round trip.
- **An unreachable API is not an `ApiError`.** No server means no envelope and
  no error code, so `fetch` throws a `TypeError` and the boundary correctly
  falls back to the generic message. Only a `success: false` response produces a
  code. When testing this, remember that a stub API must send CORS headers or
  the client-side refetch fails as a `TypeError` before `unwrap` is ever
  reached, and you will misread the result.

### SSR does not stream a pending state on a first load

With a data route like this, a hard `GET /titles` blocks until the query
resolves and then returns complete HTML — the list is in the initial response
and `pendingComponent` never appears. That is true whether the loader awaits
`ensureQueryData` or fires `prefetchQuery`, because `useSuspenseQuery` is what
holds the render back. The pending component does render when the query is slow
or failing, and on client-side navigation.

One consequence worth knowing: a slow API shows up as time-to-first-byte, not as
a spinner. Measured against a deliberately delayed API, TTFB tracked the API
latency almost exactly (a 3 s delay produced a ~3.9 s TTFB). If a route ever
needs the shell to paint first, that route's data has to move to a
non-suspending `useQuery` with its own inline skeleton.

## Known gotchas

- **Vite plugin order matters:** `tanstackStart()` must come _before_ `viteReact()`
  in `vite.config.ts`, or route generation / server-function compilation breaks.
- **`routeTree.gen.ts` is generated.** Don't hand-edit it; it's marked read-only in
  `.vscode/settings.json`. It regenerates on dev/build or via `generate-routes`.
- **Turbo build outputs:** the default `vite build` emits to `dist/client` +
  `dist/server`, already covered by root `turbo.json`'s `dist/**` cache output. If
  you later add a Nitro deployment preset that emits `.output/**` / `.nitro/**`
  (already git-ignored via the root `.gitignore`), add those globs to the root
  `build` task outputs too.
- **Dev server.** `PORT` and `API_PORT` in `.env` set the port and the
  `/_api` + `/api/auth` proxy target (see `vite.config.ts`); `pnpm bootstrap`
  writes both. The proxy is what lets `pnpm dev:tunnel` serve the web app and
  the API from one origin.
- **StyleX in dev.** TanStack Start renders no `index.html`, so the StyleX
  plugin's own dev injection never runs; `__root.tsx` links
  `/virtual:stylex.css` and its HMR runtime itself in dev.

## Legal pages

`src/routes/{privacy,terms,dmca}.tsx` must describe only what the Service actually
does. The "What we collect" section of `privacy.tsx` lists data categories and is
only correct as long as the tables behind them exist. When a feature that stores new
user content ships (comments, reports, ratings, profile fields), update that section
in the same change; when one is removed, the same rule applies in reverse — that
paragraph was wrong because `MediaChapterComment` was dropped and the copy was never
revisited.

The same goes for `privacy.tsx`'s processor list in "Who else sees it": adding a
third-party service that receives personal data is a change to that list.

## Scene & landing gotchas

The source tree carries no comments (see
`README.md` (§ Comments)). Everything non-obvious about this app
is here; StyleX rules live in `packages/ui/STYLEX.md`.

- **The scene palette is deliberately outside the semantic tokens.**
  `src/components/scene/scene.stylex.ts` is the fixed dark world shared by the
  auth screen and the landing page — a night-brown ground, warm paper text, and
  the sunrise ramp from brand red through ember and gold to a pale core. Tokens
  flip with the theme; the scene is always night, in both themes, because it is
  brand artwork rather than a surface. Layout, radii and type still come from
  the real tokens, so only colour lives there. The ground colour must match the
  `theme-color` meta in `__root.tsx`. The display serif is the one place the
  design system departs from Inter-everywhere, and it is loaded from
  `src/styles.css`.
- **Scene geometry must be deterministic.** `src/components/scene/
deterministic.ts` exists because `Math.random()` would diverge between server
  and browser and React would flag a hydration mismatch. Its `round` helper is
  needed for the same reason: the browser re-serialises long floats
  (`5.721816935692914%` → `5.72182%`), so both sides have to carry the same
  precision or the SSR string and the client's stop matching. Cover-art
  placeholders hash the title for the same reason — a given series always gets
  the same colours, so the strip never flickers on hydration.
- **Scene animations are global `@keyframes` in `src/styles.css`**, not
  `stylex.keyframes()` handles, because the landing page and the auth screen
  share them. StyleX's `animationName` only accepts a handle, so the animation
  has to ride the inline `style` prop and be merged with whatever
  `stylex.props()` emits. `src/components/scene/animated.tsx` is that merge,
  written once. `data-landing` on the landing route is the hook the
  reduced-motion block in `styles.css` keys off.
- **Sun rays are measured from the disk's EDGE outward**, as a multiple of its
  radius. Measuring from the centre would make the colour's start point depend
  on the ray's own length and current breath, so long rays would begin outside
  the disk and visibly detach from it. Each band is tucked a few px behind the
  disk so its base is never a visible edge, and it hangs off a zero-height
  rotation anchor at the sun's centre so scaling never moves where the ray
  starts. The animation uses `backwards` fill so a ray shows its retracted 0%
  keyframe during its start delay instead of snapping down when the delay
  elapses. The component's defaults are the auth screen's calibration; the
  landing hero's sun is larger and passes its own radius (a `calc()` when the
  disk is fluid).
- **The marquee renders its list twice** so the `-50%` translate lands the copy
  exactly where the original started — that is what makes the loop seamless.
  It fades into the page background at both ends rather than letting covers be
  chopped off at the viewport edge.
- **Reviews use a masonry column flow, not a grid.** The quotes are wildly
  uneven in length and a grid leaves a ragged band of empty card under each
  row.
- **`handleSubmit()` is invoked at event time, never during render.** Its
  callback reads `turnstileRef.current`, and the React Compiler must assume a
  function passed to a call made during render may itself run during render.
  Turnstile tokens are single-use, so the widget is reset after each submit to
  let the user retry.
- **Both theme halves live on `<html>`** so portals inherit them: the `dark`
  class drives `globals.css`'s custom properties, the StyleX theme classes
  drive the components.
- **Stars are hand-drawn rather than taken from the icon set.** Hugeicons' free
  tier is stroke-only and a rating needs a SOLID star to read the filled/empty
  split at 12–16px. Their `fill` is a StyleX style, not the SVG presentation
  attribute — an attribute cannot resolve `var(...)`, and these colours are
  tokens.
- **Landing copy goes through paraglide; sample data does not.**
  `landing-data.ts` holds invented titles and author names that stay literal
  because they are sample data, not UI copy. The `#` links in the footer are
  placeholders — the company and community routes do not exist yet, and
  `#titles` is the in-page cover strip.
- **`SunLink` exists because a `<button>` nested in an `<a>` is invalid HTML**
  and loses middle-click and "copy link address". Anything that navigates uses
  it instead of wrapping `SunButton`. `GhostAnchor` is the quiet half of the
  CTA pairs: same pill geometry so the two sit on one baseline, translucent
  fill instead of the gradient, so only one call to action carries the sun.
  A disabled `SunButton` nulls the whole transform property rather than
  guarding `:active`, because `:active` on the base would still fire while
  disabled.
- **The landing CTA banner is deliberately not another sun scene** — the hero
  already owns that. It is maroon-to-red with the corona pushed off one corner
  and the kanji as a watermark, so the page ends on the same warmth without
  repeating itself. The stats section gradient-clips its numerals so the figure
  itself becomes a sliver of sunlight; the flaws cards carry a single corona
  bleeding in from the top-right as their only tie back to the sun.
- **The nav drops its three section links first on a narrow screen** — the logo
  and the CTA are what a phone visitor actually needs.
- **The reveal-on-scroll helper has a deliberate timeout safety net**: if the
  observer never fires (no scroll, reduced motion, a prerender) the content
  reveals itself anyway rather than staying invisible.
- **`FormField` owns the envelope every bound field shares**: the Controller
  subscription, the label/description/error frame, and the mapping from
  react-hook-form state onto the `data-*` and `aria-*` attributes
  `@taiyomoe/ui` styles against.
- **The legal pages share one prose style object** so the three cannot drift;
  the table of contents sticks beside the prose on desktop and sits above it,
  unpinned, on narrow screens.
- **`VITE_SUPPORT_EMAIL` is where copyright notices, privacy requests and
  general support mail go** (`src/env/client.ts`).

## Next steps

- Add routes under `src/routes/`; load `@tanstack/router-core#router-core` skills as needed.
- Decide on a deployment adapter (likely Cloudflare, to match the rest of the repo).
- If tests are wanted, add a `__tests__/` dir (picked up by the root vitest config).
