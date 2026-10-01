# Plan 007: Make medias sortable by popularity

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 458557fb..HEAD -- packages/search/src apps/api/src/handlers/upsert-library-entry-handler.ts apps/api/src/handlers/remove-library-entry-handler.ts`
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

- **Priority**: P2
- **Effort**: M
- **Risk**: MED
- **Depends on**: none (independent of 001–005; pairs naturally with 005's
  browse grid, which is where the new sorts become visible)
- **Category**: direction
- **Planned at**: commit `458557fb`, 2026-09-21

## Why this matters

There is currently **no way to browse Taiyō by popularity**. `mediaSortSchema`
(`packages/search/src/medias/media-search-schemas.ts:47`) allows exactly five
sort fields — `createdAt`, `updatedAt`, `startDate`, `endDate`, `mainTitle` —
and `MediaDocument` carries no popularity signal of any kind: no library count,
no chapter count, no score.

"Popular", "trending" and "most read" are the default landing experience of
every competitor, and they are the difference between a browse page that feels
like a catalogue and one that feels like a product. Meanwhile the search index
is otherwise complete (18 filterable attributes, typo tolerance, a
case-insensitive title sort), and **the database index this needs already
exists and is unused**: `userLibraryEntries_mediaId_idx`, added in
`packages/db/src/migrations/1781700000000_refactor-user-features.ts:36`.

This plan adds two honest, cheap popularity signals — how many users have a
media in their library, and how many chapters it has — makes them sortable and
filterable, and keeps them fresh. It deliberately stops short of user ratings;
see "What this plan is not" below.

## What this plan is not

**It does not add ratings or reviews.** A rating system requires product
decisions this plan has no business making unilaterally: the scale (5 stars vs
1–10), whether averages are shown before a vote threshold, whether review text
exists, and how to resist brigading. Those decisions belong to the maintainer.

Library count is a good popularity proxy precisely because it needs none of
them: it is an existing user action, it cannot be spammed without creating
accounts, and it does not imply an editorial judgment. Ship this, see whether
ratings are still wanted.

## Current state

### `packages/search/src/medias/get-media-document.ts:14-41` — the document type

```ts
export type MediaDocument = {
  id: string
  type: MediaType
  status: MediaStatus
  source: MediaSource
  demography: MediaDemography
  countryOfOrigin: MediaCountryOfOrigin
  contentRating: ContentRating
  flag: Flag
  createdAt: number
  updatedAt: number
  startDate: number | null
  endDate: number | null
  tagKeys: string[]
  spoilerTagKeys: string[]
  linkProviders: string[]
  titleLanguages: Language[]
  chapterLanguages: Language[]
  coverLanguages: Language[]
  titles: string[]
  synopsis: Partial<Record<Language, string>>
  staffNames: string[]
  authorIds: string[]
  artistIds: string[]
  mainTitle: { title: string; language: Language } | null
  mainCoverId: string | null
  _sortMainTitle: string
}
```

Note the `_sortMainTitle` convention: a mirror field that exists purely to
drive a sort (lowercased, for case-insensitive ordering). Follow that naming
idea only where a mirror is actually needed — the counts in this plan are
plain numeric fields and need no mirror.

The builder ends with `} satisfies MediaDocument`, so adding a field to the
type will produce a compile error until the builder supplies it. That is the
guardrail — let it guide you.

### `packages/search/src/medias/init-medias-index.ts:7-62` — index settings

```ts
const filterableAttributes = [/* 20 entries */] satisfies (keyof MediaDocument)[]
const searchableAttributes = ["mainTitle.title", "titles", "synopsis", "staffNames"]
const sortableAttributes = [
  "createdAt",
  "updatedAt",
  "startDate",
  "endDate",
  "_sortMainTitle",
] satisfies (keyof MediaDocument)[]
const displayedAttributes = [/* 25 entries */] satisfies (keyof MediaDocument)[]
```

Every array is `satisfies (keyof MediaDocument)[]`, so typos are caught at
compile time. Add your new fields to `sortableAttributes`,
`filterableAttributes` and `displayedAttributes`.

### `packages/search/src/medias/media-search-schemas.ts:45-52` — the sort schema

```ts
export const mediaSortSchema = z
  .object({
    field: z.enum(["createdAt", "updatedAt", "startDate", "endDate", "mainTitle"]),
    direction: sortDirectionSchema.default("desc"),
  })
  .array()
  .max(3)
```

Note `mainTitle` here maps to `_sortMainTitle` in the index — there is an
existing translation step between the public sort name and the index
attribute. Find it in `packages/search/src/medias/search-medias.ts` before you
add a field, and extend it consistently.

### `packages/search/src/medias/sync-media.ts` (the whole file)

```ts
export const syncMedia = async (
  { db, meili, mediasIndex }: { db: Kysely<DB>; meili: Meilisearch; mediasIndex: string },
  mediaId: string,
) => {
  const doc = await getMediaDocument(db, mediaId)

  if (doc === null) {
    await meili.index(mediasIndex).deleteDocument(mediaId)

    return
  }

  await meili.index(mediasIndex).addDocuments([doc])
}
```

### The freshness problem — this is the core design question

`syncMedia` is called in `afterCommit` by **13 handlers**, all of which mutate
the media itself or its covers/chapters/staff — for example
`create-covers-handler.ts:139-141`:

```ts
c.var.afterCommit(() =>
  syncMedia({ db: c.var.db, meili: c.var.meili, mediasIndex: c.var.mediasIndex }, media.id),
)
```

**No library mutation calls it.** `apps/api/src/handlers/upsert-library-entry-handler.ts`
and `remove-library-entry-handler.ts` both run under `withTransaction`
(lines 56 and 36 respectively) — so `c.var.afterCommit` is available to them —
but neither touches search. A `libraryCount` computed in `getMediaDocument`
would therefore be correct at write time and stale immediately afterwards.

This plan resolves that by calling `syncMedia` from those two handlers, exactly
as the other 13 do. The trade-off is stated honestly in Maintenance notes: it
puts a full document rebuild on the bookmark path. That is the right call
_now_ — consistency with an established pattern, no new dependencies, no
scheduler — and the escape hatch if it becomes hot is documented.

### `packages/db/src/models/user-library-entry-model.ts` (the whole file)

```ts
export interface UserLibraryEntry {
  userId: string
  mediaId: string
  status: UserLibraryStatus
  createdAt: Generated<Timestamp>
  updatedAt: Generated<Timestamp>
}
```

One row per (user, media). Counting rows per `mediaId` is the library count,
and `userLibraryEntries_mediaId_idx` is the supporting index.

### Repo conventions you must match

- **Read `.agents/skills/create-backend-route/SKILL.md`** before touching
  `search-medias-handler.ts`. Every schema field gets
  `.meta({ description, example })`; route descriptions are consumer-facing and
  must not leak internals (no "Meilisearch", no "index", no "document").
- Search input schemas live in `packages/search`, not in the handler. The
  handler imports `searchMediasInputSchema`.

## Commands you will need

| Purpose                      | Command                                                          | Expected on success |
| ---------------------------- | ---------------------------------------------------------------- | ------------------- |
| Install                      | `pnpm install`                                                   | exit 0              |
| Lint + typecheck             | `pnpm lint`                                                      | exit 0              |
| Format check / fix           | `pnpm format` / `pnpm format:fix`                                | exit 0              |
| Start infra                  | `docker compose up -d`                                           | services healthy    |
| Migrate + seed               | `pnpm -F db kysely migrate latest && pnpm -F db kysely seed run` | exit 0              |
| **Re-init the search index** | `pnpm -F scripts cli init-meilisearch`                           | exit 0              |
| Run API                      | `pnpm -F api dev`                                                | listening on :3002  |
| Unit tests                   | `pnpm test:unit`                                                 | all pass            |
| Integration tests            | `pnpm test:integration`                                          | all pass            |

**`pnpm -F scripts cli init-meilisearch` is mandatory after any change to
`MediaDocument` or the index settings.** Adding a sortable attribute that the
index has not been told about makes Meilisearch reject the sort at query time,
not at write time — so the failure shows up as a runtime 4xx from the search
engine, not a compile error.

## Scope

**In scope**:

- `packages/search/src/medias/get-media-document.ts`
- `packages/search/src/medias/init-medias-index.ts`
- `packages/search/src/medias/media-search-schemas.ts`
- `packages/search/src/medias/search-medias.ts` (the sort-field translation)
- `apps/api/src/handlers/search-medias-handler.ts` (response schema + OpenAPI
  docs for the new fields)
- `apps/api/src/handlers/upsert-library-entry-handler.ts` (add `afterCommit`)
- `apps/api/src/handlers/remove-library-entry-handler.ts` (add `afterCommit`)
- `apps/api/src/__integration-tests__/medias/` (search sort tests)
- `apps/api/src/__integration-tests__/library/` (freshness test)
- `docs/engineering-notes.md` (create or append — the library↔search coupling)

**Out of scope** (do NOT touch):

- **Ratings, reviews, scores.** See "What this plan is not".
- View counts / read counts. `userHistories` is upserted per (user, chapter),
  so it cannot produce a view count, and a real counter needs a counter store.
  Separate decision.
- Any database migration. This plan adds no columns; the counts are derived.
- `packages/search/src/client.ts` and `SEARCH_INDEXES` — no new indexes.
- Facet counts (`facetDistribution`). Recorded separately in
  `plans/README.md`; a genuinely good browse-filter UI wants it, but it is an
  independent change.
- The web UI. Plan 005 owns surfacing these sorts; this plan makes them exist.

## Git workflow

- Branch: `advisor/007-popularity-signals` off `rewrite`.
- Conventional Commits. Suggested: `feat(search): rank medias by library and chapter counts`.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Add the counts to the document

In `packages/search/src/medias/get-media-document.ts`:

1. Add to `MediaDocument`:

```ts
/** How many users have this media in their library. */
libraryCount: number
/** How many non-deleted chapters this media has, across all languages. */
chapterCount: number
```

2. `pnpm lint` will now fail on the `satisfies MediaDocument` at the end of the
   builder. That is expected — it is telling you exactly what to supply.

3. Compute both in the builder. The function already runs several queries; add
   these to the existing parallel batch rather than issuing them serially —
   read how `titles`, `covers`, `staffs` and `chapterLanguageRows` are fetched
   and follow that shape.
   - `libraryCount`: count of `userLibraryEntries` where `mediaId` matches.
   - `chapterCount`: count of `chapters` where `mediaId` matches and
     `deletedAt is null`. Note the existing code already queries `chapters` for
     `chapterLanguageRows` — reuse that query if it can serve both without
     becoming unreadable; otherwise keep them separate. Correctness first.

Both must be plain `number`, never `null` — a media with no library entries is
`0`. Kysely's `countAll` returns a string-ish value on Postgres in some
configurations; the repo's existing pattern is
`db.fn.countAll<number>().as("count")` followed by `Number(row.count)` (see
`apps/api/src/handlers/list-my-history-handler.ts:67-73`). Do the same
conversion and do not trust the generic alone.

**Verify**: `pnpm lint` → exit 0.

### Step 2: Register the fields with the index

In `packages/search/src/medias/init-medias-index.ts`, add `libraryCount` and
`chapterCount` to:

- `sortableAttributes` — this is the point of the plan.
- `filterableAttributes` — so a client can ask for "medias with at least N
  chapters", which is a genuinely useful browse filter.
- `displayedAttributes` — so the values come back in search hits and the UI can
  render "12,400 readers" on a card.

Do not add them to `searchableAttributes`; full-text search over a number is
meaningless.

**Verify**: `pnpm lint` → exit 0, and the `satisfies (keyof MediaDocument)[]`
assertions still hold.

### Step 3: Expose the new sort fields

In `packages/search/src/medias/media-search-schemas.ts`, extend the sort enum:

```ts
    field: z.enum([
      "createdAt",
      "updatedAt",
      "startDate",
      "endDate",
      "mainTitle",
      "libraryCount",
      "chapterCount",
    ]),
```

Then find the sort-field translation in
`packages/search/src/medias/search-medias.ts` — the one that maps the public
name `mainTitle` to the index attribute `_sortMainTitle` — and make sure the
two new names pass through to identically-named attributes. **Read that code
before assuming it is a pass-through**; if it is an explicit map, add entries.

Also extend `mediaFilterSchema` with numeric filters for the two counts,
matching how the existing numeric/date filters are built in
`packages/search/src/utils/filter-schemas.ts`. Reuse an existing filter helper;
do not invent a new filter shape.

**Verify**: `pnpm lint` → exit 0.

### Step 4: Surface the fields in the API response

In `apps/api/src/handlers/search-medias-handler.ts`, add `libraryCount` and
`chapterCount` to `mediaHitSchema` with `.meta({ description, example })`,
matching the style of the surrounding fields:

```ts
  libraryCount: z
    .number()
    .int()
    .meta({ description: "How many users have this media in their library.", example: 12_400 }),
  chapterCount: z
    .number()
    .int()
    .meta({ description: "How many chapters this media has.", example: 214 }),
```

Update the route `description` to mention that results can be sorted by
popularity — **in consumer language**. Do not write "Meilisearch", "index",
"document" or "sortable attribute". Something like: "Use `sort` to order by
recency, title, chapter count, or how many readers have it in their library."

**Verify**: `pnpm lint` → exit 0; with the API running,
`curl -s http://localhost:3002/openapi.json | grep -c "libraryCount"` ≥ 1.

### Step 5: Keep `libraryCount` fresh

In both `apps/api/src/handlers/upsert-library-entry-handler.ts` and
`apps/api/src/handlers/remove-library-entry-handler.ts`, add an `afterCommit`
call that re-syncs the affected media, copying the exact shape used by the
other 13 handlers:

```ts
c.var.afterCommit(() =>
  syncMedia({ db: c.var.db, meili: c.var.meili, mediasIndex: c.var.mediasIndex }, mediaId),
)
```

Place it immediately before the `return c.ok(...)`, as the other handlers do.
Both routes already run under `withTransaction`, so `afterCommit` is available;
confirm that before writing the call.

Record _why_ a library write touches search in `docs/engineering-notes.md`,
not in a source comment (see the repo convention above): `libraryCount` is a
search-document field, so a bookmark changes the document. It is a surprising
coupling and the note is what stops a future cleanup from deleting the call.

**Verify**: `pnpm lint` → exit 0.

### Step 6: Re-initialize the index and check a real sort

```bash
docker compose up -d
pnpm -F db kysely migrate latest && pnpm -F db kysely seed run
pnpm -F scripts cli init-meilisearch
pnpm -F api dev   # in another shell
```

Then:

```bash
curl -s -X POST http://localhost:3002/medias/search \
  -H 'Content-Type: application/json' \
  -d '{"sort":[{"field":"libraryCount","direction":"desc"}],"perPage":5}'
```

**Verify**: a `{"success":true,...}` envelope whose `data` entries each carry
`libraryCount` and `chapterCount`, ordered descending by `libraryCount`. A
Meilisearch error about an invalid sort attribute means step 2 or the re-init
did not take.

### Step 7: Integration tests

Follow the structure of the existing suites — same `api(app, path)` helper from
`../helpers/request`, same `res.body.success` narrowing before touching
`res.body.data`. Look at an existing search test under
`apps/api/src/__integration-tests__/medias/` for how a test asserts against a
seeded index.

- **Sort works**: searching with `sort: [{field: "libraryCount", direction: "desc"}]`
  returns results in non-increasing `libraryCount` order. Same for
  `chapterCount`.
- **Counts are correct**: for one seeded media, the returned `libraryCount`
  equals a direct `select count(*) from userLibraryEntries where mediaId = …`
  against the test database, and `chapterCount` excludes soft-deleted chapters.
  Soft-delete a chapter inside the test (each test gets a freshly-cloned
  database) rather than editing the shared seeds.
- **Freshness**: this is the test that protects step 5. Add a library entry via
  `PUT /users/me/library/:mediaId`, then search, and assert `libraryCount`
  increased by one. Then remove it and assert it went back down.
  If the test infrastructure does not index into a real Meilisearch, report
  that rather than faking it — see STOP conditions.
- **Zero case**: a media nobody has in their library returns `libraryCount: 0`,
  not `null` and not a missing field.

**Verify**: `pnpm test:integration -- medias` and
`pnpm test:integration -- library` → all pass.

### Step 8: Full gate

**Verify**: `pnpm format` → 0; `pnpm lint` → 0; `pnpm test:unit` → pass;
`pnpm test:integration` → pass.

## Test plan

- **New tests** as enumerated in step 7, in
  `apps/api/src/__integration-tests__/medias/` (sort + counts) and
  `.../library/` (freshness).
- **Structural pattern**: the existing suites in those two directories.
- **The case most worth writing** is freshness. Everything else in this plan is
  a field that either exists or does not; the freshness coupling added in
  step 5 is the part that can silently regress — someone removes the
  `afterCommit` as "an unnecessary search write in a library handler" and
  popularity quietly freezes.
- **Verification**: `pnpm test:integration` → all pass.

## Done criteria

ALL must hold:

- [ ] `pnpm lint` exits 0
- [ ] `pnpm format` exits 0
- [ ] `pnpm test:unit` exits 0
- [ ] `pnpm test:integration` exits 0, including the freshness test
- [ ] `pnpm -F scripts cli init-meilisearch` exits 0
- [ ] The step 6 `curl` returns results sorted by `libraryCount` descending,
      each carrying both new fields
- [ ] `curl -s http://localhost:3002/openapi.json | grep -c "libraryCount"` ≥ 1
- [ ] `grep -c "libraryCount" packages/search/src/medias/init-medias-index.ts`
      returns 3 (sortable, filterable, displayed)
- [ ] `grep -n "syncMedia" apps/api/src/handlers/upsert-library-entry-handler.ts apps/api/src/handlers/remove-library-entry-handler.ts`
      returns one match per file
- [ ] `git diff --name-only` includes no file under `packages/db/src/migrations/`
- [ ] `git status --porcelain` lists only files from the In-scope list
- [ ] `plans/README.md` status row for 007 updated

## STOP conditions

Stop and report back (do not improvise) if:

- The integration-test harness does not index into a real Meilisearch instance,
  so the sort and freshness tests cannot be written honestly. Report it — a
  mocked search test would assert nothing. (`docker-compose.yml` runs
  Meilisearch and `.github/workflows/ci.yml` starts it as a CI service, so it
  should be available; confirm before concluding otherwise.)
- Adding `libraryCount` to `filterableAttributes` pushes the index over a
  Meilisearch limit, or `init-meilisearch` fails on the new settings.
- `getMediaDocument`'s query count grows enough to make `syncMedia` visibly
  slow — it already runs several queries, and step 5 puts it on the bookmark
  path. If a single `syncMedia` takes more than ~200ms against the seeded
  database, report the measurement instead of shipping it.
- You find yourself wanting to add a migration, a ratings table, or a new
  BullMQ queue. All three are out of scope and the third is the documented
  escape hatch for a problem you should report rather than pre-empt.
- The sort-field translation in `search-medias.ts` turns out to be an explicit
  allowlist that rejects unknown fields at runtime, and extending it is not
  obvious. Report what you found.

## Maintenance notes

- **For the reviewer**: two things. (1) The `afterCommit(syncMedia)` calls
  added to the two library handlers look like they do not belong there —
  confirm the `docs/engineering-notes.md` section explaining them was written,
  because that is what stops a future cleanup from deleting them. (2) Confirm `init-meilisearch` was run;
  a correct diff with a stale index produces runtime sort errors that no test
  in CI will catch unless CI re-inits.
- **Known scaling limit, with its escape hatch.** Step 5 rebuilds an entire
  search document on every bookmark. `getMediaDocument` issues several queries
  and re-serializes titles, covers and staff to change one integer. At low
  volume this is the right trade — it is consistent with the 13 existing call
  sites and needs no new infrastructure. When bookmarks get hot, the fix is
  either a Meilisearch _partial_ document update (`updateDocuments` with just
  `{ id, libraryCount }`) or an hourly recompute job on the scheduler that
  already exists in `apps/worker/src/maintenance.ts` (`upsertJobScheduler`,
  `"0 * * * *"`). Prefer the partial update; it keeps the data fresh.
  Note that `apps/worker` currently has no `@taiyomoe/search` dependency, so
  the scheduler route costs a new package edge.
- **`chapterCount` is already correct without step 5** — chapter create,
  update and delete all call `syncMedia` today
  (`create-chapter-handler.ts:101`, `update-chapter-handler.ts:90`,
  `delete-chapter-handler.ts:54`). Only `libraryCount` needed new wiring.
- **Interaction with content rating.** Neither count is rating-aware, and
  search returns all content ratings unconditionally today (no handler reads
  the per-user `contentRating` setting defined in
  `packages/db/src/json-types.ts:18-24`). When that gap closes, decide whether
  "popular" should be computed per-audience or globally — a globally-ranked
  NSFW title surfacing on a filtered browse page is the failure mode.
- **Deferred, and deliberately the maintainer's call**: user ratings. If they
  ship later, `ratingAverage` / `ratingCount` follow exactly the pattern this
  plan establishes — document field, three index arrays, sort enum, translation
  map, `afterCommit` on the mutation. This plan is the template.
