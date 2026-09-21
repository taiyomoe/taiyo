---
name: create-backend-route
description: Use when adding a new HTTP route to `apps/api` — a Hono handler in `src/handlers/` wired into a router in `src/routers/`. Covers OpenAPI spec, JSON/multipart validation, auth, error codes, transactions, evlog context, pre-checks, and offset pagination. Triggers on "add a route", "create an endpoint", "new handler in apps/api". Skip for tweaks to existing handlers that don't introduce a new route.
---

# create-backend-route

A route is a Hono handler exported from `apps/api/src/handlers/<verb>-<resource>-handler.ts` and mounted in `apps/api/src/routers/<resource>-router.ts`. The canonical reference is `apps/api/src/handlers/create-media-handler.ts` — read it before starting.

## File layout and wiring

- One handler per file. Name: `<verb>-<resource>-handler.ts` (`update-media-handler.ts`, `list-medias-handler.ts`, `delete-media-handler.ts`).
- Export a `Hono` instance: `export const xxxHandler = new Hono().get|post|patch|delete("/<path>", ...middlewares, async (c) => {...})`.
- Mount it in `src/routers/<resource>-router.ts` via `.route("/", xxxHandler)`. Register the router from `src/index.ts` if new.

## OpenAPI spec (`describeRoute`)

```ts
describeRoute({
  summary: "...",
  description: "...",         // consumer-facing only, no internals
  tags: ["Medias"],
  requestBody: { ... },        // omit on GET / DELETE without body
  responses: {
    201: { description: "...", content: { "application/json": { schema: resolver(apiSuccessEnvelope(...)) } } },
    ...getOpenApiResponses({ 404: "...", 409: "...", 422: "..." }),
  },
})
```

Rules:

- `description`: explain the contract from a consumer's POV. **Never leak internals** — do not mention transactions, DB tables, evlog, S3, "we do X behind the scenes". Just what the endpoint does and what it returns.
- Every field gets `.meta({ description, example })`. Array fields also get `.meta({ description, examples: [...] })` on the array itself. Examples must be realistic and varied.
- Wrap success bodies in `apiSuccessEnvelope(dataSchema)`. For paginated lists, pass a `meta` schema as the second argument: `apiSuccessEnvelope(itemSchema.array(), paginationMetaSchema)`.
- Build error responses with `getOpenApiResponses({ <status>: "<description>" })`. 401/403/500 are added automatically. **Every `c.fail(code)` you can emit must be represented here.**
- `tags`: exactly one tag per route, matching the resource (`["Medias"]`).

### Prose conventions

Write for the API consumer. They don't care about implementation. Specifically:

- **Summary**: short, verb-first, no "a new" filler. ✅ `"Create a media"`, `"Update a cover"`, `"Delete a banner"`, `"Set the main cover"`, `"Refresh a media in search"`. ❌ `"Create a new media"`, `"Force a media to be reindexed in search"`, `"Update a cover's metadata"`.
- **Description**: state what the endpoint does and any consumer-visible constraints (e.g. "the main cover cannot be deleted"). Keep it to 1–3 sentences. Markdown is rendered (Scalar UI).
- **Response 200 description**: noun-form, one short phrase, period. ✅ `"Media updated."`, `"Covers of the media."`, `"Matching medias."` ❌ `"Media updated successfully."`, `"Returns the covers of the media."`
- **Banned phrasing** (these leak internals):
  - `soft-delete` / `soft-deleted` → just `delete` / `deleted`. If reversibility matters to the consumer, say "can be restored later".
  - `non-deleted` / `not yet deleted` → don't mention; consumers assume listings show current state.
  - `Marks the X as deleted` / `Sets deletedAt` → say "Removes X from listings" or "Deletes X".
  - `the underlying file is retained` / `kept in storage` → drop. Say "can be restored later" if relevant.
  - `Recomputes the search document` / `pushes to the index` / `after a backfill` → describe the user-visible effect, e.g. "so that search reflects the current state".
  - `Stored for moderation audit` / `Stored for compliance` → drop. The field is just "A short explanation for the change."
  - `Restricted to moderators` (in description body) → move to the **Required roles** footer (see below).
  - `Patches the metadata of an existing X` → `Updates the metadata of X`. (`Patches` and `existing` add nothing.)

### Permissions footer

Every route's `description` ends with **one line** stating who can call it. Derive from `withAuth(action, subject)` and the role table in `abilities.ts`. Current mapping for `Media`:

| `withAuth(...)` | Footer |
|---|---|
| (none, public route) | `**Authentication:** none.` |
| `("create" \| "update" \| "delete", "Media")` | `**Required roles:** uploader, moderator, admin.` |
| `("manage", "Media")` | `**Required roles:** moderator, admin.` |

Format inside `describeRoute({ description: ... })`:

```ts
description:
  "Updates the metadata of a media. Omitted fields are kept as-is.\n\n**Required roles:** uploader, moderator, admin.",
```

Footer is a blank line + bolded label + values. Always match the actual `withAuth(...)` line beneath — when you change one, change the other.

## Auth

Every route uses `withAuth(action, resource)`. Pick the pair from `apps/api/src/middlewares/abilities.ts`. **If no existing pair fits, ask the user** — do not invent abilities silently.

## Validation

Always use the project's own `validate-*-middleware.ts` helpers — they fail with `c.fail("VALIDATION_ERROR", issues)` so every error stays in the standard envelope. **Never** use `validator(...)` from `hono-openapi` directly: it responds with its own non-envelope shape.

- **JSON body** (default for mutations): `validateJson(schema)` → `c.var.json`. If no `validate-json-middleware.ts` exists yet, mirror `validate-query-middleware.ts` to create one (ask the user first).
- **Multipart** (only when the request contains a `File`): `validateFormData(schema)` → `c.var.formData!`. Add `checkImages()` after it when images are uploaded.
- **Query**: `validateQuery(schema)` → `c.var.query`.
- **Path params**: `validateParam(schema)` → `c.var.param`.

Reuse schemas from `apps/api/src/utils/schemas.ts` (`languageSchema`, `contentRatingSchema`, `fileSchema`, `paginationQuerySchema`, `paginationMetaSchema`, `apiSuccessEnvelope`). If you're tempted to inline a schema that's already used elsewhere as a literal, **hoist it into `schemas.ts` and update existing callers** before reusing.

## Transactions

Wrap all mutations (POST/PATCH/PUT/DELETE) with the `withTransaction` middleware. Skip it on pure GETs.

## Pre-checks

Before INSERT/UPDATE, run cheap existence / conflict / referential checks and return a typed `c.fail(...)` early. Goal: precise error codes instead of DB-constraint exceptions. Patterns from `create-media-handler.ts`:

- Referenced ids exist (`STAFF_NOT_FOUND` when joined rows are missing).
- Uniqueness on natural keys / external links (`MEDIA_LINK_CONFLICT`).
- Target row exists for UPDATE / DELETE (`MEDIA_NOT_FOUND`).

## Errors (`utils/errors.ts`)

- Use `c.fail(code, details?)` — never throw, never hand-build error responses.
- Codes are grouped by resource (`mediaErrors`, `staffErrors`, ...). **Don't hesitate to add a new code** when no existing one fits semantically. Keep messages user-safe (no internals).
- Every `c.fail` call site must have a matching entry in the route's `getOpenApiResponses({...})`.

## evlog context

Use `c.var.log.set({...})` to attach structured context as it becomes available:

- Resource identity as soon as known: `log.set({ media: { id: mediaId } })`.
- Loaded/inserted row: `log.set({ media })` after the INSERT or fetch.
- Don't log request bodies, secrets, or PII.

## Pagination (list endpoints)

Offset-based, with the pagination fields on a `meta` object on the response (NOT on `data`):

```ts
const querySchema = paginationQuerySchema.extend({ /* extra filters */ })

// in the handler:
const { page, perPage } = c.req.valid("query")

const [items, [{ count }]] = await Promise.all([
  db.selectFrom("medias").selectAll().limit(perPage).offset((page - 1) * perPage).execute(),
  db.selectFrom("medias").select(db.fn.countAll<number>().as("count")).execute(),
])

return c.ok(items, { page, perPage, total: count })
```

Response shape: `apiSuccessEnvelope(itemSchema.array(), paginationMetaSchema)`.

## Relations

- **Detail (`GET /<resource>/:id`)**: return the full aggregate — embed cheap 1:N relations inline (titles, covers, banners, staffs, links). They belong to the entity.
- **List (`GET /<resource>`)**: return a slim projection (e.g. main title, main cover, type/status). Never embed full relations in list responses.
- **Unbounded / heavy collections** (chapters, comments, history): always their own paginated sub-route (`GET /<resource>/:id/<collection>`), never inlined.
- Don't add `?include=` style expansion until a real caller needs it.

## Response

- Success: `return c.ok(data)` (201 on POST, 200 otherwise — handled by the middleware). With pagination: `return c.ok(items, { page, perPage, total })`.
- Failure: `return c.fail("CODE", details?)`.

## Testing

Every new route gets a co-located integration test that hits real Postgres / S3 / Meilisearch (via docker-compose). No mocks.

### File layout

- One file per handler: `src/__integration-tests__/<resource>/<verb>-<resource>.test.ts`. Folder structure mirrors `src/handlers/`.
- Import `test` from `../setup` — **never** from `vitest` directly. The setup-provided `test` is `baseTest.extend<{ services, app }>` and gives each test a fully isolated stack.

### Per-test isolation is automatic

For each test the fixture provides:

- A fresh Postgres database, cloned from a template that already has migrations + `pnpm -F db kysely seed run` applied.
- A fresh S3 bucket.
- A `services` bundle: `{ db, s3, s3Bucket, meili, auth }`.
- An `app` built via `createApp(services)`.

Everything is torn down at the end of the test. **Do not** add `beforeEach`/`afterEach` for cleanup, do not truncate tables, do not manage state across tests.

### Read everything off the fixture

```ts
test("does the thing", async ({ app, services }) => {
  const { headers } = await signInAs(services, { role: "ADMIN" })
  const res = await api(app, "/path", { method: "POST", headers, json: {...} })
  // assert against services.db / services.s3 / services.meili
})
```

**Never** import `db`, `s3Client`, `meiliClient`, or `auth` from `@taiyomoe/*` packages or from `../services`. The route handlers get their dependencies from `c.var`; the tests get them from the fixture. There is no other source.

### Helpers (in `src/__integration-tests__/helpers/`)

- `signInAs(services, { role?, banned?, email? })` — inserts a user + session row and returns `{ userId, headers: { Cookie } }` with a signed cookie. Default role is `"USER"`.
- `api(app, path, { method?, headers?, json?, form? })` — wraps `app.request` and parses the envelope. Returns `{ status, body }`. Always use this; do not call `app.request` directly.
- `getPng()`, `invalidImage()`, `oversizedImage()` from `helpers/fixtures.ts` — real `File` objects for multipart routes.
- `waitForMeiliMediaDoc(services, id)` — polls until a doc is indexed (Meili indexing is async). Use it after routes that schedule a search sync via `c.var.afterCommit(...)`.

### Using seeded data

The template DB is pre-seeded — your test starts with whatever the kysely seed files (`packages/db/src/seeds/`) inserted. For read-side tests (`GET /<resource>/:id`, `GET /<resource>`), reference seeded entities directly by their hardcoded id from the seed file. **Do not write custom seed helpers** like `seedMedia` / `seedStaff`; the kysely seeds are the single source of truth, and adding test-only seeding routes around them just creates drift.

### Cases to cover

**Baseline (every route using `withAuth`):**

- `UNAUTHORIZED` — request with no `Cookie` header.
- `FORBIDDEN` — signed in as a banned user.
- `FORBIDDEN` — signed in as a role too weak for the ability (only when the route requires more than `USER`).
- One `VALIDATION_ERROR` — a single representative missing/invalid field. **Don't enumerate every zod rule** — that's library-tested.

**Route-specific:**

- **Happy path** — drive the route to success and assert end-state on **every** surface it touches:
  - DB rows: `services.db.selectFrom(...).executeTakeFirst()`.
  - S3 objects (for uploads): `services.s3.send(new ListObjectsV2Command({ Bucket: services.s3Bucket, Prefix: ... }))`.
  - Search docs (when the route schedules `syncMedia` via `afterCommit`): `await waitForMeiliMediaDoc(services, id)` and assert it's not null.
- **One test per `c.fail("…")` code** listed in `getOpenApiResponses`. If you declared `409: "…"` in the OpenAPI spec, there must be a test that triggers that 409.
- **Rollback** — for any route wrapping mutations in `withTransaction` that also uploads files: force a mid-handler failure (a `c.fail` from a pre-check that runs after the upload) and assert nothing leaked — no DB row, no S3 object.

### Assertion patterns

Discriminate on the envelope to narrow the body type:

```ts
const res = await api<{ id: string }>(app, "/path", { method: "POST", headers, form })
expect(res.status).toBe(201)
if (!res.body.success) throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
// res.body.data is now typed
```

For DB count assertions, snapshot before and compare the delta — seeded data is present, so absolute counts (`toHaveLength(1)`) will be wrong:

```ts
const before = await services.db.selectFrom("<table>").select("id").execute()
// ... act ...
const after = await services.db.selectFrom("<table>").select("id").execute()
expect(after).toHaveLength(before.length + 1)  // or +0 for rollback
```

### Things to skip

- Exhaustive zod validation tests — one 422 per route is enough.
- Re-testing the response envelope shape — covered once globally.
- Permutations of roles per route — test the boundary, not every role.
- Mocks of external services — the test stack is real. If docker isn't running, the user needs to run `docker compose up -d`, not the test needs a mock.

### Style rules (match the rest of the codebase)

- Helpers used only once are inlined. Helpers used 2+ times sit at the top of the test file.
- Functions that return a value use the `get` prefix (e.g. `getForm`, `getPng`) — matching the package-level `getDb` / `getS3Bucket` convention.

## Final checklist

- [ ] Handler in `src/handlers/`, mounted in the right router (router registered in `src/index.ts` if new).
- [ ] `describeRoute` includes summary, description (no internals), tags, request schema, **every possible response** including each `c.fail` code.
- [ ] Summary is verb-first and short; response 200 description is noun-form; no "successfully" / "soft-delete" / "non-deleted" / "underlying file" anywhere in the prose.
- [ ] `description` ends with a permissions footer (`**Authentication:** none.` or `**Required roles:** …`) that matches the actual `withAuth(...)` call.
- [ ] `tags` is a single-element array matching the resource (no slash-grouped tags).
- [ ] `withAuth(action, resource)` with a real ability pair (asked if unsure).
- [ ] Schemas reused from `utils/schemas.ts`; shared inline schemas hoisted.
- [ ] Mutations wrapped in `withTransaction`.
- [ ] Pre-checks for referenced ids and conflicts, each mapped to a real code in `errors.ts`.
- [ ] evlog context set at the natural points.
- [ ] No internal leakage in OpenAPI descriptions or error messages.
- [ ] Test file at `src/__integration-tests__/<resource>/<verb>-<resource>.test.ts`, importing `test` from `../setup`.
- [ ] Baseline auth cases: 401 unauthenticated, 403 banned, 403 too-weak-role (when applicable).
- [ ] One representative 422 `VALIDATION_ERROR` case.
- [ ] Happy path asserts end-state on every surface the route touches (DB, S3, Meili).
- [ ] One test per `c.fail` code declared in `getOpenApiResponses`.
- [ ] Rollback test for any `withTransaction` route that uploads files.
- [ ] No runtime imports from `@taiyomoe/*` packages or `../services` in the test — only `services` + `app` from the fixture.
