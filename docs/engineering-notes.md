# Engineering notes

Backend and infrastructure rationale that would otherwise live in source
comments. The source tree carries no comments (see `README.md`, § Comments), so
this file is where the "why" lives for everything outside `packages/ui` and
`apps/web`. See `packages/ui/STYLEX.md` for UI/StyleX and `apps/web/AGENTS.md`
for the web app.

## `GET /chapters/latest` must be mounted before `getChapterHandler`

`apps/api/src/routers/chapters-router.ts` registers
`listLatestChaptersHandler` as its first `.route("/", …)` call, above
`getChapterHandler`. The ordering is load-bearing: `getChapterHandler`
registers `GET /:id`, so if it were registered first a request to
`GET /chapters/latest` would match `/:id` with `id = "latest"` and
`checkChapter()` would reject it with a 422 "not a valid UUID" before the
latest-chapters handler ever ran.

Nothing in the type system or the linter protects this. A future cleanup that
sorts the imports and the `.route(...)` calls alphabetically would silently
break the route. The only thing that catches a regression is the integration
test `apps/api/src/__integration-tests__/chapters/list-latest-chapters.test.ts`.

## The two chapter feeds share one row shape

`GET /chapters/latest` and `GET /users/me/feed` return the same row shape, so
the web client can render one component for both. The shape is defined once as
`chapterFeedItemSchema` in `apps/api/src/utils/schemas.ts`, and both handlers
select exactly those columns — a divergence between the two responses is a
design decision, not something to introduce by accident.

Both feeds read the media's main title with a correlated scalar subquery
(`titles` where `isMainTitle`) rather than a join. A join would be wrong twice
over: an inner join silently drops a chapter whose media has no live main
title, and because nothing in the schema enforces at most one main title per
media, a join could emit a chapter twice and corrupt pagination. The subquery
yields exactly one nullable value per chapter.

Both feeds also order by `(createdAt desc, id desc)`. The `id` tiebreak is
what makes offset pagination safe when two chapters share a `createdAt` to the
millisecond — which is the normal case for a batch upload, and for the seeded
data.

## Image extensions on covers and banners

Cover and banner objects are stored at `medias/{mediaId}/covers/{coverId}.{ext}`
with `ext` either `gif` (animated uploads) or `jpg` (everything else, which
`checkImages` transcodes). Because the extension is not derivable from the row's
other columns, `covers.extension` and `banners.extension` persist it so that
`getCoverUrl` / `getBannerUrl` can build a resolvable URL. A check constraint
pins each column to `{'jpg', 'gif'}` — the codomain of `extensionForMimeType`.

Every write path must derive the S3 key and the stored `extension` from a
**single** expression. If the two are computed separately they can drift, and a
drifted row yields a URL that 404s with nothing in the row to reveal it. The
three write paths are `create-covers-handler.ts`, `create-banners-handler.ts`
and `create-media-handler.ts`; each hoists `const extension` above the
`uploadFile` call and reuses it in the inserted row.

Handlers select `extension` and drop it from the response: consumers get `url`,
not the storage detail behind it.

Staff images (`getStaffImageKey`, used by `create-staff-handler.ts` and
`update-staff-handler.ts`) have the same latent problem and no persisted
extension. When a staff surface needs image URLs, the covers/banners change is
the template.

## `apps/api`'s response types are load-bearing for `apps/web`

`apps/web` talks to `apps/api` through Hono RPC (`hc<AppType>()` in
`apps/web/src/lib/api.ts`). `hc` derives the client's request and response
types from the app's inferred `Schema`, which is assembled from two things
only: the `TypedResponse` each handler returns, and the `Input` generic each
middleware in a route's chain declares. Neither is something the API gets for
free — both are spelled out deliberately, and both degrade silently when
removed.

### `ok` and `fail` must keep returning `Response & TypedResponse<…>`

`apps/api/src/middlewares/context-middleware.ts` declares `AppContext.ok` and
`AppContext.fail` as returning `Response & TypedResponse<JSONParsed<T>, S,
"json">` — the same intersection Hono's own `c.json()` returns. The two halves
each do a job:

- The `TypedResponse` half is what `hc` reads. Every one of the API's handlers
  returns `c.ok(…)` / `c.fail(…)` rather than `c.json(…)` directly, so if these
  two signatures say `Response`, **every route in the app infers as `Response`
  and the entire generated client collapses to `any`**.
- The `Response` half is what keeps the rest of the app compiling. Roughly
  twenty `check-*` / `require-*` / `validate-*` middlewares, plus `app.notFound`
  and the `onError` handler, sit in positions Hono types as returning
  `Response`. Declaring the return as a bare `TypedResponse` breaks all of them
  at once.

`JSONParsed<T>` is applied for the same reason Hono applies it: the client
receives whatever survived `JSON.stringify`, so a `Date` column must surface as
`string` on the client, not as `Date`. Without it the client would be typed
confidently and wrongly.

`ok` is declared as an overload pair rather than one signature with an optional
`meta`, so that paginated routes get `meta` as a required, precisely-typed
property and unpaginated routes get no `meta` key at all. An overloaded
signature cannot be satisfied by an arrow-function expression, which is why the
two assignments in the middleware body carry
`as AppContext["ok"]` / `as AppContext["fail"]` casts. The casts are over the
_signature_, not over any value — the implementations still call `c.json(…)`
and are unchanged at runtime.

`200 | 201` is the status for `ok` because the implementation picks it from the
request method at runtime (`c.req.method === "POST" ? 201 : 200`). `fail`'s
status is computed per error code from `apps/api/src/utils/errors.ts`, which is
declared `as const`; that is what makes `(typeof errors)[C]["code"]` resolve to
a literal status rather than `number`.

**Nothing in `apps/api`'s own test suite fails if any of this is simplified
away.** The integration tests assert on runtime JSON, which does not change.
The only symptom is that `apps/web` quietly stops being type-checked against
the API. This is the single highest-value thing to guard when reviewing changes
to `context-middleware.ts`.

### The validators' third generic, and why query and param are typed loosely

`validate-json-middleware.ts`, `validate-query-middleware.ts` and
`validate-param-middleware.ts` pass `createMiddleware`'s third generic
(`I extends Input`) in addition to the `Env` generic. That generic is the only
hook `hc` reads request types from — it is the same mechanism
`@hono/zod-validator` uses. Without it the client accepts any request shape.

The three are not typed the same way, on purpose:

- **JSON** declares `{ in: { json: z.input<TSchema> }; out: { json:
z.output<TSchema> } }`. Hono types `ValidationTargets.json` as `any`, so a
  Zod input type can be declared there without fighting a constraint. JSON
  bodies are therefore fully typed on the client.
- **Query** declares `in` as `Record<string, string | string[]>` and **param**
  as `Record<string, string>` — Hono's own target types, not `z.input`.
  `ValidationTargets.query` is `Record<string, string | string[]>`, and these
  schemas coerce (`page` and `perPage` arrive as strings and parse to numbers),
  so a coercing schema's `z.input` does not satisfy the constraint and the
  build fails.

The consequence is a deliberate asymmetry: **responses and JSON bodies are
fully typed on the client; query-string keys and path params are not.** That is
most of the value for a fraction of the fight. If the loose typing becomes
painful, the fix is to split each query schema into a string-shaped input schema
plus an explicit coercion step — not to weaken the constraint.

`validate-form-data-middleware.ts` is deliberately left without the generic.
Multipart bodies here include nested arrays containing `File`s, which do not fit
`ValidationTargets.form`. Those endpoints keep working at runtime and stay
untyped on the client.

### `z.coerce.*` fields are unchecked on the client, even inside JSON bodies

Zod 4 types `z.coerce.number()`'s **input** as `unknown` — coercion exists
precisely to accept whatever arrives. `paginationQuerySchema` in
`@taiyomoe/schemas` builds `page` and `perPage` that way, and
`searchMediasInputSchema` spreads it in, so on the RPC client
`api.medias.search.$post({ json: { page: "nonsense" } })` **type-checks** even
though the rest of the body does not: `q: 123`, an unknown `filter` operator and
a bad `sort.field` are all rejected at compile time.

This is the same coercion problem that forces query strings to be typed loosely,
surfacing inside a JSON body. It is narrow — it affects exactly the
`z.coerce`-built fields, which today means pagination — and no client generator
that honours Zod's declared input types would do better. The fix, if it matters,
is the same one: a string-shaped input schema plus an explicit coercion step,
rather than `z.coerce` in the schema the client is derived from.

## Library writes touch the search index

`PUT /users/me/library/:mediaId` and `DELETE /users/me/library/:mediaId` both
register an `afterCommit(syncMedia)` callback. This looks out of place — a
bookmark is a user-scoped write and has nothing to do with the media itself —
but it is load-bearing.

`MediaDocument` carries two popularity signals:

- `libraryCount` — how many rows `userLibraryEntries` holds for the media.
- `chapterCount` — how many non-deleted `chapters` rows it has, across every
  language.

Both are derived at document-build time by `getMediaDocument`, not stored on
`medias`. They are registered as sortable, filterable and displayed attributes
in `init-medias-index.ts`, and `mediaSortSchema` exposes them as public sort
fields, so "popular" and "most chapters" browse orderings read straight off
them.

`chapterCount` needs no extra wiring: chapter create, update and delete already
sync the media. `libraryCount` did — nothing on the library path touched search
before, so the count would have been correct the moment a document was built
and stale from the next bookmark onwards.

**Do not delete those two `afterCommit` calls.** They are not a stray search
write in a library handler; removing them silently freezes popularity ranking
at whatever the last media-side edit produced. The integration test in
`apps/api/src/__integration-tests__/library/library-search-freshness.test.ts`
exists to catch exactly that.

### The scaling trade-off

`syncMedia` rebuilds the whole document — it re-queries titles, covers, staff
and chapters and re-serializes all of it — to change one integer. That is
accepted deliberately: it is the same call the other 13 mutation handlers make,
it needs no new infrastructure, and bookmark volume is low.

When it becomes hot, prefer a partial Meilisearch update (`updateDocuments`
with just `{ id, libraryCount }`) over moving the recompute onto a schedule.
The partial update keeps the count exact; an hourly job on
`apps/worker/src/maintenance.ts` would make popularity lag by up to an hour and
would cost a new `@taiyomoe/search` dependency edge for `apps/worker`, which it
does not have today.

### Known gap

Neither count is content-rating aware, and search currently returns every
content rating unconditionally. Once per-user content-rating filtering lands,
decide whether "popular" is computed per-audience or globally — a globally
ranked NSFW title surfacing on a filtered browse page is the failure mode.

## API request pipeline

### Middleware ordering is a hard dependency

Middlewares communicate through `c.var`, so order is load-bearing and nothing
enforces it:

- `checkMedia()` / `checkChapter()` / `checkCover()` / `checkBanner()` /
  `checkGroup()` / `checkStaff()` / `checkList()` / `checkUser()` /
  `checkOwnershipRequest()` resolve `:id` to a row and publish it on `c.var`.
  Each rejects `VALIDATION_ERROR` when the id is not a UUID and a typed
  `*_NOT_FOUND` otherwise. They exclude soft-deleted rows unless passed
  `{ includeDeleted: true }` — which is what restore routes use.
  `checkUser()` publishes `c.var.targetUser`, deliberately distinct from
  `c.var.user` (the authenticated caller), and treats a banned user as absent.
- `requireChapterAccess()` / `requireGroupAccess()` /
  `requireGroupOwnerOrMod()` / `requireListOwner()` must run **after**
  `withAuth(...)` and the matching `check*`, because they read both vars. They
  fail `FORBIDDEN`. The access model itself is documented in
  `docs/group-ownership.md`.
- `checkImages()` must run **after** `validateFormData(...)`.

### `withTransaction()` is the atomicity contract

- DB writes go through a Kysely transaction; `c.get("db")` is the trx.
- S3 uploads recorded on `log.uploadedKeys` are deleted if the request fails.
  Routes append with `log.set({ uploadedKeys: [key] })` after each successful
  `PutObject`; evlog merges arrays by concatenation.
- `c.var.afterCommit(cb)` defers a side-effect (search-index push, job enqueue)
  until the transaction has actually committed, so that work is never tied to a
  rolled-back write. Callback failures are logged, never thrown — a successful
  write must not be reported as failed because a downstream hiccuped.
- It rolls back and cleans up both when the handler throws (the error is
  re-thrown to the global error handler) and when the handler responds with
  status >= 400 (the response is preserved).
- The S3 cleanup itself swallows its own errors, so a cleanup failure cannot
  mask the original one. Orphans are reaped manually or by the lifecycle rule.

### `checkImages()` writes back to two places

Handlers read processed files from `c.var.formData`, not from the underlying
`FormData`. The middleware therefore walks the dot-separated key
(`covers.0.file`) into the nested object Zod built and replaces the leaf, _as
well as_ calling `formData.set(key, processedFile)`. Without the nested write
the original unprocessed `File` reference survives and the route uploads raw
user bytes. The pipeline validates size, confirms the format by magic bytes,
re-encodes GIFs to strip metadata while preserving animation, and otherwise
auto-rotates by EXIF then transcodes to JPEG — rotation must happen before the
strip or the orientation is lost.

`packages/utils/extension-for-mime-type` mirrors that normalisation (JPEG for
everything that is not a GIF); the two must stay in agreement.

### CORS

`CORS_ALLOWED_ORIGINS` is a comma-separated list of origins allowed to call the
API with credentials. Empty or unset disables the CORS middleware entirely, so
only same-origin requests work — which is how the web app's dev proxy reaches
the API.

### Rate limits

`hono-rate-limiter/redis` expects an Upstash-style client and `ioredis` exposes
the same primitives under different names, so the wrapper is built once at
module load. Routes share one Dragonfly DB with better-auth's secondary
storage — the `prefix` argument is what keeps per-route counters from
colliding. Admins are exempt (moderation is not bounded by per-route budgets);
authenticated users are keyed on user id, anonymous requests on client IP.

## Concurrency invariants

- **Approving a group-ownership request takes a Postgres advisory lock**
  (`pg_advisory_xact_lock(hashtextextended(groupId, 0))`). Without it, two
  concurrent approvals both `SELECT` no OWNER, both `INSERT`, and the workflow
  produces two OWNERs — against the intent of "first approval wins, the rest
  are auto-cancelled". The lock is transaction-scoped and keyed on the group,
  so approvals for different groups still run in parallel.
- **Setting a main cover unsets the previous one first, then promotes.** The
  unique partial index on `covers(mediaId) WHERE isMainCover` guarantees the
  invariant; doing the unset first is what keeps the transaction from violating
  it mid-flight under concurrent calls.
- **`isUniqueViolation()` (`apps/api/src/utils/pg-errors.ts`) exists because
  some pre-checks are racy by nature** — a TOCTOU window between `SELECT` and
  `INSERT`/`UPDATE` inside a transaction. It lets the losing caller surface a
  typed conflict instead of an opaque 500.
- **Creating a media rejects links that already belong to another media.** It
  almost always means someone is re-importing a media that was already
  imported.

## Queue, worker and staging lifecycle

- **BullMQ requires `maxRetriesPerRequest: null`.** Pass raw connection options
  rather than a pre-built `ioredis` instance so BullMQ creates its own
  connection per queue/worker — the documented best practice.
- **BullMQ v6 removed `repeat` from `JobsOptions`**; `upsertJobScheduler` is
  the replacement and is keyed by scheduler id, so repeated boots and multiple
  replicas do not multiply the schedule. Scheduling maintenance on every boot
  is therefore idempotent by construction.
- **The page processor walks pages sequentially** to bound memory. Concurrency
  across chapters is governed by the BullMQ worker concurrency setting, never
  here.
- **A job with nothing actionable returns cleanly** rather than throwing, so it
  is not retried forever. Real failures re-throw so BullMQ retries per
  `defaultJobOptions`.
- **Staged originals leak from two sources**, both handled by the reaper:
  sessions opened but never finalized (Task stuck `PENDING`), and jobs that
  exhausted their retries (Task `FAILED` — the worker only deletes staging on
  success). It deletes the staged objects and the Task rows once older than
  `config.images.staleUploadReapHours`. It is pure and injectable; pass `now`
  in tests.
- **`DeleteObjects` caps at 1000 keys per call**, so the reaper chunks.
  Deleting an absent key is a no-op, and a delete hiccup never fails the reap —
  the bucket lifecycle rule is the backstop.
- **The bucket lifecycle rule is best-effort.** Some S3-compatible stores
  (RustFS, Garage) do not implement the lifecycle API, so callers catch and log
  rather than crash the worker. It is a backstop for the reaper, not a
  replacement for it.

## Search

- **`mainTitle` sorts on `_sortMainTitle`**, a lowercased mirror, so
  alphabetical ordering is case-insensitive. The internal field is excluded
  from `displayedAttributes`, so consumers never see it.
- **`hasAll` compiles to one equality per value, chained with AND.**
  Meilisearch matches each equality against any element of the array, so the
  chain is what enforces "contains every".
- **Index creation ignores its own error**: Meilisearch fails when the index
  already exists, and that is the expected steady state.
- The filter translator is resource-agnostic — each resource ships its own
  `FilterSpec` plus a Zod schema producing compatible input, and the translator
  returns `undefined` when there are no clauses so callers can omit `filter`.

## Auth

The before-hook on sign-in checks two things that the credential provider
cannot: whether the email/username belongs to a **non-credential** provider
(the user should be sent to OAuth instead), and whether the account is
unverified with a verification mail already pending (so verification mail is
not re-sent too often).

## Email

Email styling is inline styles, not classes. Mail clients strip or ignore
stylesheets to wildly different degrees, so every declaration has to travel on
the element's `style` attribute. That rules out the design system's StyleX
tokens, which compile to classes plus a stylesheet — hence `theme.ts`'s small
self-contained palette, shared by the templates so the three of them cannot
drift.

## Cache

`rawCacheClient` is the raw `ioredis` instance, reserved for callers that own
their own key schema (the rate limiter, BullMQ). Application data goes through
`cacheClient`.

## Integration-test harness

- `global-setup.ts` runs **once per `vitest` invocation**, not once per worker.
  It provisions the template database that the per-test fixture in `setup.ts`
  clones. Without it every worker would race on `DROP`/`CREATE` of the same
  template DB.
- Teardown ignores a missing Meilisearch index — init may have failed.
- `jpegWithExif` builds a JPEG carrying an EXIF block so the image tests can
  assert that `checkImages` strips the metadata and transcodes: the object that
  lands in S3 must report no EXIF.
- Rate-limit tests send a fresh UUID as `X-Forwarded-For` per invocation so the
  counter starts empty regardless of leftover Dragonfly state from prior runs.
- Reaper tests pass a `now` 25 hours in the future, because
  `staleUploadReapHours` is 24.
- Fixtures reference seeded rows by name (`media-1` is Boruto, `scansPROJECT`
  is already linked, Kodachi is already an AUTHOR) so inserts do not
  FK-violate. The seeds are in `packages/db/src/seeds/`.

## Config

- `config.images` bounds the upload pipeline: 10 MB per image, JPEG quality 85
  for covers and 82 for chapter pages (lower, to save storage), 15 MB and 500
  pages per chapter, a 600 s presigned-URL lifetime, 3 days before `staging/`
  objects expire by lifecycle rule, and 24 hours before a PENDING/FAILED upload
  Task and its staged objects are reaped.
- `config.limits` bounds user text: 200 for names (group, staff, media title)
  and chapter titles, 50 for a volume tag, 500 for URL fields, 5000 for
  descriptions, 10000 for a per-language synopsis.
- `tags.ts` mirrors the MangaDex genre and format lists as of 25 December 2025
  and the AniList tag list as of 3 December 2025. The AniList set deliberately
  omits Boys' Love, Crime, Historical, Isekai, Medecine, Philosophy, Superhero,
  Tragedy and Wuxia, which the other two sources already cover.

## Tooling

- **`oxlint`'s React Compiler rules ship inside the `correctness` category**
  (aligned with the upstream ESLint presets), so enabling that category turns
  on `react/purity`, `react/refs`, `react/immutability`,
  `react/preserve-manual-memoization`, `react/set-state-in-render`,
  `react/set-state-in-effect`, `react/static-components`, `react/use-memo`,
  `react/void-use-memo`, `react/error-boundaries` and `react/globals`. These
  replaced the single `react/react-compiler` nursery rule in oxlint 1.79.
- **`vitest/no-standalone-expect` is disabled** because it misfires on tests
  that import `test` from a custom setup helper.
- **`knip.ts` registers a CSS compiler** so `@import` in a stylesheet counts as
  a dependency edge. That used to come free from the CSS framework's knip
  plugin; with the framework gone, nothing registers it, and every CSS-only
  dependency (the font packages imported from
  `packages/ui/src/styles/globals.css` and `apps/web/src/styles.css`) would
  read as dead. The matcher skips specifiers with a URL scheme or a
  protocol-relative host — those are fetched at runtime, not resolved from
  `node_modules`.
- **Storybook's `getAbsolutePath` helper** resolves a package's absolute path;
  it is needed in Yarn PnP setups and inside a monorepo.
- **Storybook themes go on `<html>`**, next to the addon's `dark` class, so
  components rendered into portals inherit the dark tokens. Every story renders
  into a decorator that sets `isolate`, giving popups and backdrops their own
  stacking context so one story's overlay cannot paint over Storybook's chrome.
- **`apps/storybook/vite.config.ts` names the cloudflared quick-tunnel domain
  in `allowedHosts`** so `cloudflared tunnel --url http://localhost:6006` can
  serve the dev server for a design review without disabling Vite's Host
  check.
- **Both apps declare the same three-layer cascade** via
  `stylex.vite({ useCSSLayers: { before: ["base", "structural"] } })`, and
  `@taiyomoe/ui` must be listed in `externalPackages` because it is a workspace
  package resolved through `node_modules` that ships StyleX source. That option
  is implemented in `@stylexjs/unplugin`'s core but missing from its
  `UserOptions` type in 0.19.0, hence the cast. StyleX also needs the same
  `@/*` alias the bundler and tsconfig use, because it resolves
  `*.stylex.ts` variable imports itself. In `apps/web`, `stylex()` must come
  before the React transform, and React Compiler runs through
  `plugin-react`'s native `compiler` option backed by `oxc-transform-react`.
