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

## Final checklist

- [ ] Handler in `src/handlers/`, mounted in the right router (router registered in `src/index.ts` if new).
- [ ] `describeRoute` includes summary, description (no internals), tags, request schema, **every possible response** including each `c.fail` code.
- [ ] `withAuth(action, resource)` with a real ability pair (asked if unsure).
- [ ] Schemas reused from `utils/schemas.ts`; shared inline schemas hoisted.
- [ ] Mutations wrapped in `withTransaction`.
- [ ] Pre-checks for referenced ids and conflicts, each mapped to a real code in `errors.ts`.
- [ ] evlog context set at the natural points.
- [ ] No internal leakage in OpenAPI descriptions or error messages.
