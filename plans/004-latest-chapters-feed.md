# Plan 004: Add the "latest chapters" and personal feed endpoints

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 458557fb..HEAD -- apps/api/src/routers/chapters-router.ts apps/api/src/routers/users-router.ts apps/api/src/handlers/list-chapters-handler.ts apps/api/src/handlers/list-my-history-handler.ts`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: direction
- **Planned at**: commit `458557fb`, 2026-09-21

## Why this matters

A manga platform's home page is made of two queries: *"what chapters were
released recently across the site"* and *"what's new in the series I follow"*.
**Neither has an endpoint.**

The only chapter-listing route is `GET /medias/:id/chapters`
(`apps/api/src/handlers/list-chapters-handler.ts`), which is scoped to a single
media and ordered by chapter *number* ascending — the right shape for a
media detail page, the wrong shape for a feed. There is no global
reverse-chronological listing and no library-scoped one.

The cost is concrete: `apps/web/src/routes/index.tsx` is a marketing landing
page precisely because there is nothing for a real home page to fetch. The
index that the personal feed needs already exists and is going unused —
`userLibraryEntries_userId_status_updatedAt_idx`, added in
`packages/db/src/migrations/1781700000000_refactor-user-features.ts:30`.

This is a small, low-risk, additive plan that unblocks the home page.

## Current state

### `apps/api/src/routers/chapters-router.ts` (the whole file)

```ts
export const chaptersRouter = new Hono()
  .route("/", getChapterHandler)
  .route("/", updateChapterHandler)
  .route("/", deleteChapterHandler)
  .route("/", listChapterGroupsHandler)
  .route("/", linkChapterGroupHandler)
  .route("/", unlinkChapterGroupHandler)
  .route("/", openChapterHandler)
  .route("/", updateChapterHistoryHandler)
  .route("/", createChapterUploadSessionHandler)
  .route("/", finalizeChapterUploadHandler)
  .route("/", getChapterUploadStatusHandler)
```

**Routing order matters here and it is the one real trap in this plan.**
`getChapterHandler` registers `GET /:id` and is mounted *first*. A request to
`GET /chapters/latest` would match `/:id` with `id = "latest"`, and
`checkChapter()` would reject it with a 422 "not a valid UUID" before your new
handler ever ran. The new handler **must be mounted before
`getChapterHandler`**.

### `apps/api/src/handlers/list-my-history-handler.ts` — your structural exemplar

Read this file in full before writing anything. It is the closest existing
analogue: an authenticated, paginated, reverse-chronological feed that joins
`chapters`. Copy its shape — the `paginationQuerySchema` / `paginationMetaSchema`
imports, the `Promise.all([items, totalRow])` pattern, the
`c.ok(items, { page, perPage, total: Number(totalRow.count) })` return.

```ts
  withAuth("read", "History"),
  validateQuery(paginationQuerySchema),
  async (c) => {
    const { db, user } = c.var
    const { page, perPage } = c.var.query
    const [items, totalRow] = await Promise.all([
      db
        .selectFrom("userHistories")
        .innerJoin("chapters", "chapters.id", "userHistories.chapterId")
        .where("userHistories.userId", "=", user.id)
        .where("chapters.deletedAt", "is", null)
        .select([
          "userHistories.chapterId",
          "chapters.number as chapterNumber",
          // …
        ])
        .orderBy("userHistories.updatedAt", "desc")
        .limit(perPage)
        .offset((page - 1) * perPage)
        .execute(),
      db
        .selectFrom("userHistories")
        .innerJoin("chapters", "chapters.id", "userHistories.chapterId")
        .where("userHistories.userId", "=", user.id)
        .where("chapters.deletedAt", "is", null)
        .select(db.fn.countAll<number>().as("count"))
        .executeTakeFirstOrThrow(),
    ])

    return c.ok(items, { page, perPage, total: Number(totalRow.count) })
  },
```

### `apps/api/src/handlers/list-chapters-handler.ts:48-60` — the per-media listing

```ts
    const { db, media } = c.var
    const { page, perPage } = c.var.query
    const [items, totalRow] = await Promise.all([
      db
        .selectFrom("chapters")
        .select(["id", "title", "number", "volume", "language", "contentRating", "flag"])
        .where("mediaId", "=", media.id)
        .where("deletedAt", "is", null)
        .orderBy("number", "asc")
        .orderBy("language", "asc")
        .limit(perPage)
        .offset((page - 1) * perPage)
        .execute(),
```

Note it does **not** select `pages` — chapter listings stay small on purpose.
Your feed handlers must do the same.

### Relevant tables

From `packages/db/src/database.ts`: `chapters`, `medias`, `titles`,
`userLibraryEntries`. A feed row needs the chapter *and* enough of its media to
render a row (media id and its main title), so both handlers join `titles`
where `isMainTitle` is true. Read `apps/api/src/handlers/get-media-handler.ts:144-172`
for how titles are joined and selected elsewhere before inventing your own.

### Repo conventions you must match

**Read `.agents/skills/create-backend-route/SKILL.md` in full before writing a
line.** It is the repo's binding contract for new routes. The rules that will
bite you:

- One handler per file, named `<verb>-<resource>-handler.ts`, exporting a
  `Hono` instance; mounted in the resource's router via `.route("/", …)`.
- Full `describeRoute({ summary, description, tags, responses })` with
  `resolver(apiSuccessEnvelope(itemSchema.array(), paginationMetaSchema))` for
  paginated lists.
- Every schema field gets `.meta({ description, example })` with realistic
  examples.
- `summary` is verb-first with no filler: `"List the latest chapters"`, not
  `"Get a list of the latest chapters"`.
- Response 200 `description` is noun-form and short: `"The latest chapters."`
- **Never leak internals** in `description` — no tables, no indexes, no joins.
- The description ends with a permissions footer:
  `**Authentication:** none.` for the public route,
  `**Authentication:** signed-in user.` for the personal feed.
- Every `c.fail(code)` you can emit must appear in `getOpenApiResponses({...})`.
- Pure GETs skip `withTransaction`.
- Reuse `paginationQuerySchema` / `paginationMetaSchema` from
  `@taiyomoe/schemas`; do not inline new pagination schemas.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Install | `pnpm install` | exit 0 |
| Lint + typecheck | `pnpm lint` | exit 0 |
| Format check / fix | `pnpm format` / `pnpm format:fix` | exit 0 |
| Start infra | `docker compose up -d` | services healthy |
| Migrate + seed | `pnpm -F db kysely migrate latest && pnpm -F db kysely seed run` | exit 0 |
| Unit tests | `pnpm test:unit` | all pass |
| Integration tests | `pnpm test:integration` | all pass |
| One suite | `pnpm test:integration -- chapters/list-latest-chapters` | all pass |

## Scope

**In scope**:

- `apps/api/src/handlers/list-latest-chapters-handler.ts` (create)
- `apps/api/src/handlers/list-my-feed-handler.ts` (create)
- `apps/api/src/routers/chapters-router.ts` (mount, in the right position)
- `apps/api/src/routers/users-router.ts` (mount)
- `apps/api/src/__integration-tests__/chapters/list-latest-chapters.test.ts` (create)
- `apps/api/src/__integration-tests__/library/list-my-feed.test.ts` (create)

**Out of scope** (do NOT touch):

- `apps/api/src/handlers/list-chapters-handler.ts` — the per-media listing is
  correct as it is. Its `number asc` ordering is right for a detail page.
- `apps/api/src/index.ts` — both routers are already registered; you are adding
  handlers to existing routers, not new routers.
- Any change that returns `pages` from a listing endpoint.
- RSS/Atom serialization — a feed *format* is a separate decision. Ship JSON.
- `packages/search` / the Meilisearch document — do not add a "latest" index.
- Notifications, follows-based feeds, or "new chapter" push. Out of scope.

## Git workflow

- Branch: `advisor/004-latest-chapters-feed` off `rewrite`.
- Conventional Commits. Suggested: `feat(api): add latest-chapters and personal feed endpoints`.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Build `GET /chapters/latest`

Create `apps/api/src/handlers/list-latest-chapters-handler.ts`.

- Public (no `withAuth`).
- `validateQuery(paginationQuerySchema)`.
- Selects chapter id / number / volume / title / language / contentRating /
  createdAt, plus `mediaId` and the media's main title.
- Excludes soft-deleted chapters (`chapters.deletedAt is null`) **and**
  soft-deleted medias (`medias.deletedAt is null`) — join `medias` for this.
- `orderBy("chapters.createdAt", "desc")`, then `orderBy("chapters.id", "desc")`
  as a deterministic tiebreak so pagination cannot drop or duplicate rows when
  two chapters share a timestamp.
- `tags: ["Chapters"]`.

Do **not** select `pages`.

**Verify**: `pnpm lint` → exit 0.

### Step 2: Mount it before the `/:id` route

In `apps/api/src/routers/chapters-router.ts`, add
`.route("/", listLatestChaptersHandler)` **as the first `.route(...)` call**,
above `getChapterHandler`.

Add a short comment explaining why, so nobody reorders it later:

```ts
export const chaptersRouter = new Hono()
  // Must precede getChapterHandler: its `/:id` pattern would otherwise
  // swallow `/latest` and reject it as an invalid UUID.
  .route("/", listLatestChaptersHandler)
  .route("/", getChapterHandler)
  // …
```

**Verify**: with infra up and `pnpm -F api dev` running,
`curl -s "http://localhost:3002/chapters/latest?page=1&perPage=5" | head -c 200`
→ a `{"success":true,...}` envelope, **not** a 422 UUID validation error.

### Step 3: Build `GET /users/me/feed`

Create `apps/api/src/handlers/list-my-feed-handler.ts`, modelled directly on
`list-my-history-handler.ts`.

- Path `/me/feed`, mounted on the users router.
- Gate: `withAuth("read", "Library")` — this reads the caller's library, and
  that ability is granted to every non-banned user
  (`apps/api/src/utils/abilities.ts`).
- Joins `userLibraryEntries` (caller's rows) → `chapters` on `mediaId` →
  `medias`, excluding soft-deleted chapters and medias.
- Same ordering and tiebreak as step 1.
- Same row shape as step 1, so the web client can render one component for both
  feeds. This is the point — do not let the two responses drift.
- `tags: ["Library"]`.

Mount it in `apps/api/src/routers/users-router.ts` alongside the other
`/me/*` handlers. Ordering is not a concern there (no competing `/:id` GET on
that prefix) but keep it grouped with the other `me` routes.

**Verify**: `pnpm lint` → exit 0.

### Step 4: Integration tests

Follow the structure of
`apps/api/src/__integration-tests__/chapters/get-chapter.test.ts` exactly —
same `describe` / `test` imports from `../helpers/request` and `../setup`, same
`res.body.success` narrowing before touching `res.body.data`.

`chapters/list-latest-chapters.test.ts`:
- 200 with a populated `data` array and a `meta` carrying `page`, `perPage`, `total`.
- Results are ordered `createdAt` descending — assert on adjacent pairs.
- No soft-deleted chapter appears. Use the seeded data; if no seeded chapter is
  soft-deleted, soft-delete one *inside the test* via the test's db handle
  (each test gets a freshly-cloned database, so this is safe) rather than
  editing the shared seeds.
- No item carries a `pages` field.
- `perPage` is honoured.

`library/list-my-feed.test.ts`:
- 401 when unauthenticated.
- 200 for a signed-in seeded user, returning only chapters whose media is in
  that user's library.
- A media absent from the library does not appear.

Look at an existing authenticated suite under
`apps/api/src/__integration-tests__/library/` for how a session is established
in tests before writing the auth cases.

**Verify**: `pnpm test:integration -- chapters/list-latest-chapters` → pass;
`pnpm test:integration -- library/list-my-feed` → pass.

### Step 5: Confirm the OpenAPI spec picked both routes up

With the API running:

```bash
curl -s http://localhost:3002/openapi.json | grep -c "/chapters/latest"
curl -s http://localhost:3002/openapi.json | grep -c "/users/me/feed"
```

**Verify**: each returns at least 1. If either returns 0, the `describeRoute`
block is malformed — fix it before proceeding.

### Step 6: Full gate

**Verify**: `pnpm format` → 0; `pnpm lint` → 0; `pnpm test:unit` → pass;
`pnpm test:integration` → pass.

## Test plan

- **New suites**: `chapters/list-latest-chapters.test.ts` and
  `library/list-my-feed.test.ts`, with the cases enumerated in step 4.
- **Structural pattern**: `apps/api/src/__integration-tests__/chapters/get-chapter.test.ts`
  for shape; an existing `library/` suite for authenticated setup.
- **The case most worth writing**: ordering plus the deterministic tiebreak.
  Seeded chapters are likely inserted in one batch and may share a
  `createdAt` to the millisecond — which is exactly the condition under which a
  missing tiebreak silently corrupts pagination.
- **Verification**: `pnpm test:integration` → all pass.

## Done criteria

ALL must hold:

- [ ] `pnpm lint` exits 0
- [ ] `pnpm format` exits 0
- [ ] `pnpm test:unit` exits 0
- [ ] `pnpm test:integration` exits 0, including both new suites
- [ ] `curl -s "http://localhost:3002/chapters/latest?page=1&perPage=5"` returns
      a success envelope, not a 422
- [ ] `curl -s http://localhost:3002/openapi.json | grep -c "/chapters/latest"` ≥ 1
- [ ] `curl -s http://localhost:3002/openapi.json | grep -c "/users/me/feed"` ≥ 1
- [ ] `grep -n "listLatestChaptersHandler" apps/api/src/routers/chapters-router.ts`
      shows it on a line *before* `getChapterHandler`
- [ ] `grep -n "pages" apps/api/src/handlers/list-latest-chapters-handler.ts apps/api/src/handlers/list-my-feed-handler.ts`
      returns no matches
- [ ] `git status --porcelain` lists only files from the In-scope list
- [ ] `plans/README.md` status row for 004 updated

## STOP conditions

Stop and report back (do not improvise) if:

- `GET /chapters/latest` still returns a 422 UUID error after step 2 — the
  mount-order fix is the whole mechanism; if it does not work, something about
  Hono's matching has changed and the plan's premise is wrong.
- `withAuth("read", "Library")` does not exist or is not granted to ordinary
  users in `apps/api/src/utils/abilities.ts`. Do not invent a new CASL subject
  or action — the route skill says to ask rather than invent abilities.
- The two feed responses cannot share a row shape without contorting one of the
  queries. Report the conflict; a divergent shape is a real design decision,
  not something to settle silently.
- You need to modify `list-chapters-handler.ts` or add a database index.
  Adding an index may well be right, but it belongs in its own reviewed change.

## Maintenance notes

- **For the reviewer**: check two things specifically — (1) that
  `listLatestChaptersHandler` is mounted above `getChapterHandler`, since a
  future alphabetical-sort-the-imports cleanup would silently break the route
  and only the integration test would catch it; (2) that both feed responses
  still share one row shape.
- **Performance**: `GET /chapters/latest` orders by `chapters.createdAt desc`
  across the whole table. Verify there is an index supporting it before this
  sees real traffic — `packages/db/src/migrations/1781682265000_add-missing-indexes-and-invariants.ts`
  is where such indexes live. Deliberately not added here.
- **Offset pagination** is the repo-wide convention and this plan follows it,
  but a reverse-chronological feed is the classic case where offset paging
  drifts as new rows arrive. Cursor pagination is the eventual answer; the
  deterministic `(createdAt, id)` ordering added here is what a cursor would be
  built on.
- **Interaction**: when notifications land (recorded in `plans/README.md`,
  and stubbed by the `TODO(plan-001)` at `packages/queue/src/processor.ts:99`),
  the personal feed and "new chapter" notifications will share this query.
  Factor it then, not now.
- **Interaction**: neither endpoint filters by content rating. Once user
  settings are honoured (`packages/db/src/json-types.ts:18-24` defines
  `contentRating`, and nothing reads it), both feeds must respect it. That is
  the same gap search and every list route has today.
