---
name: create-backend-route
description: Use when adding a new HTTP route to `apps/api` — a Hono handler in `src/handlers/` wired into a router in `src/routers/`. Covers OpenAPI spec and prose conventions, JSON/multipart validation, auth, error codes, transactions, evlog context, pre-checks, and offset pagination. Triggers on "add a route", "create an endpoint", "new handler in apps/api". Skip for tweaks to existing handlers that don't introduce a new route.
---

# create-backend-route

A route is a Hono handler exported from `apps/api/src/handlers/<verb>-<resource>-handler.ts` and mounted in `apps/api/src/routers/<resource>-router.ts`. The canonical reference is `apps/api/src/handlers/create-media-handler.ts` — read it before starting.

## File layout and wiring

- One handler per file. Name: `<verb>-<resource>-handler.ts` (`update-media-handler.ts`, `list-medias-handler.ts`, `delete-media-handler.ts`).
- Export a `Hono` instance: `export const xxxHandler = new Hono().get|post|patch|delete("/<path>", ...middlewares, async (c) => {...})`.
- Mount it in `src/routers/<resource>-router.ts` via `.route("/", xxxHandler)`. Register the router in `src/app.ts` if new.

## OpenAPI spec (`describeRoute`)

```ts
describeRoute({
  summary: "...",
  description: "...\n\n**Required roles:** uploader, admin.",
  tags: ["Medias"],
  responses: {
    201: { description: "...", content: { "application/json": { schema: resolver(apiSuccessEnvelope(...)) } } },
    ...getOpenApiResponses({ 401: true, 403: true, 404: "...", 422: "..." }),
  },
})
```

Rules:

- **Request side is generated.** The `validate*` middlewares and the `checkX()` middlewares feed hono-openapi through `withRequestSpec` (`utils/openapi-helper.ts`): query params, path params and the request body come from the schema they validate. Leave `requestBody` and `parameters` out of `describeRoute`; put the documentation on the schema itself, as `.meta({ description, example })` on every field.
- Every field gets `.meta({ description, example })`. Array fields also get `.meta({ description, examples: [...] })` on the array itself. Examples must be realistic and varied.
- Wrap success bodies in `apiSuccessEnvelope(dataSchema)`. For paginated lists, pass a `meta` schema as the second argument: `apiSuccessEnvelope(itemSchema.array(), paginationMetaSchema)`.
- The success status is what `c.ok` sends: **201 on POST, 200 otherwise**.
- Build error responses with `getOpenApiResponses({ <status>: "<description>" | true })`. Only `500` is added automatically; `true` takes the generic description. **Every `c.fail(code)` the route can emit, from the handler, its helpers and its middlewares, is listed**, and nothing else:
  - `withAuth(...)` → `401: true` and `403: true` (or a 403 string covering the generic denial plus the route's own forbidden cases).
  - `checkX()` → its `X_NOT_FOUND` 404 and a 422 for a malformed ID; `validate*` → 422; `rateLimit` → 429.
  - Public and `withOptionalAuth` routes carry no 401/403 unless the handler fails with them itself.
- `tags`: exactly one tag, declared in the `tags` list of `app.ts` and placed in one of its `x-tagGroups`. Reuse an existing tag before adding one.
- `apps/api/src/__integration-tests__/openapi.test.ts` checks the generated spec: access footer, single declared tag, 401/403 placement, every path parameter documented and described. Run it after touching a route.

### Prose conventions

Write for the API consumer: describe what the caller sees, in American English and the present tense. Address the caller as **you/your**; another user is "the user". Write "does not", "cannot", "is not" in full, in descriptions and in the error messages of `errors.ts`. Write **ID** in uppercase in prose ("by ID"). Put enum values, field names and param names in backticks in route descriptions (`` `PRIVATE` ``, `` `perPage` ``). Describe effects, never the machinery (tables, transactions, S3, Redis, Meilisearch, queues, caches).

- **Summary**: verb first, sentence case, no final period, at most 7 words. Caller-scoped routes say "my" (`"List my library"`), another user's say "a user's" (`"List a user's lists"`). ✅ `"Create a media"`, `"Set the main cover"`, `"Demote a group owner"`. ❌ `"Create a new media"`, `"Demote an OWNER to MEMBER"`.
- **Description**: 1–3 sentences, then the access footer. The first verb mirrors the summary: Get → "Returns …", List → "Lists …", Create → "Creates …", Update → "Updates …", Delete → "Deletes …", Remove → "Removes …". Mention the order of a list ("newest first") and consumer-visible limits. On an optional-auth route, say what signed-in viewers also get ("Signed-in viewers also see whether they follow the user.").
- **2xx response**: noun phrase + period. ✅ `"The group."`, `"The matching groups."`, `"Your library."`, `"Group created."`, `"Chapter marked as read."`.
- **Error responses**: one sentence per status, from the caller's side; several causes on one status joined with ", or ".
  - 404 by path ID: `"No group with the given ID exists."`; referenced ID in the body: `"One of the staff members does not exist."`
  - 422, in this order as needed: `"The provided ID is not a valid UUID"`, `"the query parameters failed validation"`, `"the request body failed validation"`, then the route's own cases. E.g. `"The provided ID is not a valid UUID, or the request body failed validation."`
  - 409 states a conflict with the resource's state (`"You already follow this user."`); an action the caller may never take (acting on yourself, someone else's resource) is a 403. 429: `"Too many requests, try again later."`
- **Field descriptions**: a sentence with a period. IDs `"The ID of the group."`; booleans `"Whether …"`; timestamps `"When …"`; counts `"The number of …"`; other values `"The name of the group."`; nullable fields end with `", if any."`.
- **Deletions**: say "Deletes X" or "Removes X from listings"; promise "can be restored later" only when a restore route exists.

### Access footer

Every route's `description` ends with a blank line and exactly **one** footer line, derived from the route's real checks and `packages/permissions/src/rules.ts`:

| Route | Footer |
|---|---|
| public, never reads a session | `**Authentication:** none.` |
| `withOptionalAuth` | `**Authentication:** optional.` |
| `withAuth()`, any non-banned user | `**Authentication:** signed-in user.` |
| `withAuth("x.y")` gated on global roles | `**Required roles:** <roles>.` lowercase, in the order `uploader intern, uploader, moderator, admin` (e.g. `media.delete: is("UPLOADER","ADMIN")` → `uploader, admin`) |
| access depends on the resource (owner, author, invitee, group permission), possibly with roles | `**Required access:** <who>.` e.g. `the owner of the list.`, ``the group owner or a member with the `MANAGE_MEMBERS` permission.`` |

Extra restrictions ("you cannot ban yourself", "not while impersonating") go in the description body. When the route's checks change, change the footer with them.

## Auth

- `withAuth(path?)` signs the caller in and, with a path, enforces a **static** permission from `packages/permissions/src/rules.ts` (one that needs no target, e.g. `withAuth("pageReport.review")`). Without a path it only requires a signed-in, non-banned user.
- Target-dependent permissions (`group.manageMembers`, `user.ban`…) are checked with `c.var.can("x.y", target)` once the target is known, or in an `authorize-*` middleware (`authorize-group-middleware.ts`).
- Check the caller's rights **before** loading the target whenever the rule allows it, so a caller without the right gets 403 and learns nothing about the ID (`authorize-user-middleware.ts` runs before `checkUser`).
- **If no existing permission fits, ask the user**: permissions are shared with the web app.

## Validation

Always use the project's own middlewares: they fail with `c.fail("VALIDATION_ERROR", issues)` so every error stays in the standard envelope, and they document the request in the spec. `validator(...)` from `hono-openapi` answers in its own non-envelope shape.

- **JSON body** (default for mutations): `validateJson(schema)` → `c.var.json`.
- **Multipart** (only when the request contains a `File`): `validateFormData(schema)` → `c.var.formData!`. Add `checkImages()` after it when images are uploaded.
- **Query**: `validateQuery(schema)` → `c.var.query`.
- **Path params**: `checkX()` validates and loads `:id` (`checkGroup()`, `checkMedia()`…); any other path param goes through `validateParam(z.object({...}))` → `c.var.param`, so it is both checked and documented.
- Resolve what the handler needs during validation (`.transform`) rather than looking it up again in the handler, so the handler never re-checks what validation guaranteed.
- A field with a fallback is `.default(x).catch(x)`, not `.catch(x)` alone: the spec then shows it as optional.

Reuse schemas from `apps/api/src/utils/schemas.ts` and `@taiyomoe/schemas` (`languageSchema`, `storedLanguageSchema`, `contentRatingSchema`, `fileSchema`, `userSummarySchema`, `paginationQuerySchema`, `paginationMetaSchema`, `apiSuccessEnvelope`). If you're tempted to inline a schema that's already used elsewhere as a literal, **hoist it into `schemas.ts` and update existing callers** before reusing.

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
- A fresh S3 bucket, created on the first S3 command.
- Its own Meilisearch index name, with no index behind it. Tests that read the index opt in with `test.override({ search: true })` at the top of their file or `describe`: the index is then created with its primary key, its settings and the seeded medias. Meilisearch runs tasks one at a time, so the other tests stay out of its queue.
- A `services` bundle: `{ db, s3, s3Bucket, meili, mediasIndex, auth }`.
- An `app` built via `createApp(services)`.

Everything is cleaned up for you: buckets and indexes after each test, databases at the end of their file. **Do not** add `beforeEach`/`afterEach` for cleanup, do not truncate tables, do not manage state across tests.

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
- `waitForMediaDoc(services, id, until)` — polls the media document until `until(doc)` holds (Meili indexing is async). Routes never sync search themselves: Postgres triggers enqueue the media and `withTransaction` drains after commit.

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

- [ ] Handler in `src/handlers/`, mounted in the right router (router registered in `src/app.ts` if new).
- [ ] `describeRoute` has summary, description, one declared tag and **every possible response**, each `c.fail` code included; no hand-written `requestBody` or `parameters`.
- [ ] Every field of the request and response schemas has a `.meta({ description })`.
- [ ] Prose follows the conventions: verb-first summary, matching first verb, noun-form 2xx, canonical error sentences.
- [ ] `description` ends with the one access footer matching the route's real checks; 401/403 listed exactly when a session is required.
- [ ] Permissions come from `rules.ts`, checked before the target is loaded when possible (asked if none fits).
- [ ] `openapi.test.ts` passes.
- [ ] Schemas reused from `utils/schemas.ts`; shared inline schemas hoisted.
- [ ] Mutations wrapped in `withTransaction`.
- [ ] Pre-checks for referenced ids and conflicts, each mapped to a real code in `errors.ts`.
- [ ] evlog context set at the natural points.
- [ ] No internal leakage in OpenAPI descriptions or error messages.
- [ ] Test file at `src/__integration-tests__/<resource>/<verb>-<resource>.test.ts`, importing `test` from `../setup`.
- [ ] Baseline auth cases: 401 unauthenticated, 403 banned, 403 too-weak-role (when applicable).
- [ ] One representative 422 `VALIDATION_ERROR` case.
- [ ] Happy path asserts end-state on every surface the route touches (DB, S3).
- [ ] One test per `c.fail` code declared in `getOpenApiResponses`.
- [ ] Rollback test for any `withTransaction` route that uploads files.
- [ ] No runtime imports from `@taiyomoe/*` packages or `../services` in the test — only `services` + `app` from the fixture.
