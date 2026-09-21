# Plan 002: Persist image file extensions and return cover/banner URLs

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 458557fb..HEAD -- packages/db/src/models packages/db/src/migrations apps/api/src/handlers/create-covers-handler.ts apps/api/src/handlers/create-banners-handler.ts apps/api/src/handlers/get-media-handler.ts apps/api/src/handlers/list-covers-handler.ts packages/s3/src`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED
- **Depends on**: `plans/001-chapter-page-urls.md` (provides `S3_PUBLIC_URL`
  and the `publicBase` normalization this plan reuses)
- **Category**: direction
- **Planned at**: commit `458557fb`, 2026-09-21

## Why this matters

Every visual surface of a manga platform is covers: the browse grid, the media
detail hero, search results, library shelves, the home carousel. **The API
never returns a cover URL, and a client cannot derive one.**

The reason is subtle and worth stating precisely, because it is the whole
justification for the migration in this plan. Cover objects are stored at
`medias/{mediaId}/covers/{coverId}.{ext}` where `ext` is `gif` for animated
uploads and `jpg` for everything else — and **the extension is never persisted
on the row**. So even a client that knows the bucket's public base URL and the
key format still cannot construct the URL, because it cannot know whether a
given cover is a `.gif` or a `.jpg`. Banners have the identical problem.

Chapter pages do not have this problem (they are unconditionally transcoded to
`.jpg`), which is why plan 001 could ship without a schema change and this one
cannot.

## Current state

### `packages/utils/src/extension-for-mime-type.ts` (the whole file)

```ts
/**
 * Maps an image MIME type to the file extension to use when storing it.
 *
 * Mirrors the output of the API's `checkImages` middleware, which normalises
 * uploads to JPEG (anything that isn't a GIF) or GIF.
 */
export const extensionForMimeType = (mimeType: string): "gif" | "jpg" =>
  mimeType === "image/gif" ? "gif" : "jpg"
```

Two possible extensions. This is the fact that forces the migration.

### `apps/api/src/handlers/create-covers-handler.ts:105-121` (the write path)

```ts
    const coverRows = await Promise.all(
      body.covers.map(async (cover) => {
        const id = crypto.randomUUID()

        await uploadFile(
          { s3, s3Bucket, log },
          getCoverKey(media.id, `${id}.${extensionForMimeType(cover.file.type)}`),
          cover.file,
        )

        return {
          id,
          mediaId: media.id,
          volume: cover.volume !== undefined ? String(cover.volume) : null,
          language: cover.language,
          contentRating: cover.contentRating,
          isMainCover: cover.main,
          uploaderId: user.id,
        } satisfies NewCover
      }),
    )
```

The extension is computed, used for the S3 key, and then thrown away.
`create-banners-handler.ts:83` does the same with `getBannerKey`.

### `packages/db/src/models/cover-model.ts` (the whole interface)

```ts
export interface Cover {
  id: Generated<string>
  createdAt: Generated<Timestamp>
  updatedAt: Generated<Timestamp>
  deletedAt: Timestamp | null
  volume: string | null
  contentRating: Generated<ContentRating>
  isMainCover: Generated<boolean>
  language: Language
  mediaId: string
  uploaderId: string
  deleterId: string | null
}
```

No extension / mimeType / fileName column. `packages/db/src/models/banner-model.ts`
is analogous — read it before editing.

### `packages/s3/src/index.ts:31-35` (the key helpers — do not change them)

```ts
export const getCoverKey = (mediaId: string, fileName: string) =>
  `medias/${mediaId}/covers/${fileName}`

export const getBannerKey = (mediaId: string, fileName: string) =>
  `medias/${mediaId}/banners/${fileName}`
```

### Existing migration style

Migrations live in `packages/db/src/migrations/` and are named
`<epoch-millis>_<kebab-description>.ts`. The most recent is
`1781700000000_refactor-user-features.ts`. **Read it before writing yours** —
match its `up` / `down` export shape, its use of `db.schema`, and its index
naming (`<table>_<cols>_idx`).

### Repo conventions you must match

- **Read `.agents/skills/create-backend-route/SKILL.md`** before touching any
  handler. Route descriptions are consumer-facing and must not leak internals
  (no "S3", no "bucket", no "we store the extension").
- Every Zod schema field gets `.meta({ description, example })`.
- Mutations run inside `withTransaction`; pure GETs do not.
- After any media-affecting mutation, `syncMedia` is called in `afterCommit` —
  see `create-covers-handler.ts:139-141`.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Install | `pnpm install` | exit 0 |
| Lint + typecheck | `pnpm lint` | exit 0, no errors |
| Format check / fix | `pnpm format` / `pnpm format:fix` | exit 0 |
| Apply migrations | `pnpm -F db kysely migrate latest` | exit 0 |
| Roll back one migration | `pnpm -F db kysely migrate down` | exit 0 |
| Re-seed | `pnpm -F db kysely seed run` | exit 0 |
| Unit tests | `pnpm test:unit` | all pass |
| Integration tests (needs `docker compose up -d`) | `pnpm test:integration` | all pass |

## Scope

**In scope**:

- `packages/db/src/migrations/<new-timestamp>_add-image-extensions.ts` (create)
- `packages/db/src/models/cover-model.ts`
- `packages/db/src/models/banner-model.ts`
- `packages/db/src/seeds/` — only where seeded cover/banner rows need the new column
- `packages/s3/src/index.ts` — add `getCoverUrl` / `getBannerUrl`
- `apps/api/src/handlers/create-covers-handler.ts`
- `apps/api/src/handlers/create-banners-handler.ts`
- `apps/api/src/handlers/get-media-handler.ts`
- `apps/api/src/handlers/list-covers-handler.ts`
- `apps/api/src/handlers/get-cover-handler.ts`
- `apps/api/src/handlers/list-banners-handler.ts`
- `apps/api/src/handlers/get-banner-handler.ts`
- The matching integration tests under `apps/api/src/__integration-tests__/covers/`
  and `.../banners/`

**Out of scope** (do NOT touch):

- `packages/s3/src/index.ts`'s `getCoverKey` / `getBannerKey` signatures — other
  callers depend on them; add URL helpers alongside, do not rewrite these.
- Chapter pages — plan 001 owns them. Do not touch `get-chapter-handler.ts`.
- Staff images (`getStaffImageKey`) — same class of problem, but staff images
  are a secondary surface. Record it, do not fix it here.
- `packages/search/src/medias/get-media-document.ts` — the search document
  carries a main-cover *id*. Changing the document shape forces a full
  reindex and is a separate decision.
- Any change to `extensionForMimeType` or the `checkImages` middleware.

## Git workflow

- Branch: `advisor/002-cover-and-banner-urls` off the branch containing plan 001.
- Conventional Commits. Suggested:
  `feat(api): persist image extensions and return cover/banner urls`.
- Commit the migration separately from the handler changes.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Confirm the deployment assumption

Run `pnpm -F db kysely migrate list` and inspect the target database.

This plan backfills existing `covers` and `banners` rows with `'jpg'`. That is
correct **only if** the database holds no real GIF covers — true on the
`rewrite` branch, whose data comes from `pnpm -F db kysely seed run`.

If the database you are migrating contains production data, **STOP and report**
(see STOP conditions). Backfilling a real GIF cover as `'jpg'` produces a URL
that 404s, and there is no way to detect it from the row alone.

**Verify**: state in your report which database you confirmed against and how.

### Step 2: Write the migration

Create `packages/db/src/migrations/<epoch-millis>_add-image-extensions.ts`,
using a timestamp greater than `1781700000000`. Match the `up`/`down` shape of
`1781700000000_refactor-user-features.ts` exactly.

`up`:
- Add `extension text not null default 'jpg'` to `covers`.
- Add `extension text not null default 'jpg'` to `banners`.
- Add a check constraint on each allowing only `'jpg'` and `'gif'`, so the
  column can never drift from `extensionForMimeType`'s codomain.

`down`: drop both columns (and their constraints).

Keep the `default 'jpg'` in place after the migration — it makes the column
safe for any insert path that predates this change.

**Verify**:
`pnpm -F db kysely migrate latest` → exit 0, then
`pnpm -F db kysely migrate down` → exit 0, then
`pnpm -F db kysely migrate latest` → exit 0.
The migration must be reversible.

### Step 3: Add `extension` to the models

In `packages/db/src/models/cover-model.ts` and `banner-model.ts`, add:

```ts
  extension: Generated<"gif" | "jpg">
```

`Generated<>` because the column has a database default — this keeps it
optional in `NewCover` / `NewBanner` while required on select. Confirm that
`Generated` is already imported in each file (it is, for `id`).

**Verify**: `pnpm lint` → exit 0.

### Step 4: Add the URL helpers

In `packages/s3/src/index.ts`, below `getBannerKey`, add helpers that reuse the
`publicBase` constant introduced by plan 001:

```ts
/** Public URL of a cover image. */
export const getCoverUrl = (mediaId: string, coverId: string, extension: string) =>
  `${publicBase}/${getCoverKey(mediaId, `${coverId}.${extension}`)}`

/** Public URL of a banner image. */
export const getBannerUrl = (mediaId: string, bannerId: string, extension: string) =>
  `${publicBase}/${getBannerKey(mediaId, `${bannerId}.${extension}`)}`
```

If `publicBase` does not exist in the file, plan 001 has not landed — STOP.

**Verify**: `pnpm lint` → exit 0.

### Step 5: Persist the extension on upload

In `create-covers-handler.ts`, hoist the computed extension so it is used
*twice* — once for the key, once for the row:

```ts
        const id = crypto.randomUUID()
        const extension = extensionForMimeType(cover.file.type)

        await uploadFile(
          { s3, s3Bucket, log },
          getCoverKey(media.id, `${id}.${extension}`),
          cover.file,
        )

        return {
          id,
          mediaId: media.id,
          extension,
          volume: cover.volume !== undefined ? String(cover.volume) : null,
          language: cover.language,
          contentRating: cover.contentRating,
          isMainCover: cover.main,
          uploaderId: user.id,
        } satisfies NewCover
```

Apply the same change to `create-banners-handler.ts` around its
`getBannerKey(...)` call at roughly line 83.

**Verify**: `pnpm lint` → exit 0. Then
`grep -n "extensionForMimeType" apps/api/src/handlers/create-covers-handler.ts apps/api/src/handlers/create-banners-handler.ts`
→ one call per file (not two — you hoisted it, you did not duplicate it).

### Step 6: Return `url` from every read path

For each of `get-media-handler.ts` (its `coverSchema` and `bannerSchema` and
the corresponding `select`s around lines 144-172), `list-covers-handler.ts`,
`get-cover-handler.ts`, `list-banners-handler.ts`, `get-banner-handler.ts`:

1. Add `"extension"` to the Kysely `.select([...])` list.
2. Add a `url` field to the response Zod schema, with `.meta({ description, example })`.
3. Map the row to include `url: getCoverUrl(mediaId, row.id, row.extension)`
   (or `getBannerUrl`).
4. Do **not** expose `extension` itself in the response — it is an
   implementation detail; the consumer wants the URL. Select it, use it, drop it.

Note that `get-cover-handler.ts` and `get-banner-handler.ts` operate on the
image's own id and may not already select `mediaId` — add it to the select if
missing, since the URL helper needs it.

**Verify**: `pnpm lint` → exit 0, and
`grep -rn "extension" apps/api/src/handlers/*.ts | grep -c "url"` is not the
test — instead confirm by hand that no handler returns a raw `extension` field.

### Step 7: Update the seeds

`pnpm -F db kysely seed run` must still succeed. Because the column has a
default, seeded rows will get `'jpg'` automatically. Only edit seed files if
the seed explicitly enumerates columns in a way that breaks typing.

**Verify**: `pnpm -F db kysely seed run` → exit 0.

### Step 8: Extend integration tests

Add one assertion per read surface, following the structural pattern of
`apps/api/src/__integration-tests__/chapters/get-chapter.test.ts` (same
`api(app, path)` helper from `../helpers/request`, same `res.body.success`
narrowing).

- `covers/list-covers.test.ts` — every returned cover has a `url` containing
  `/medias/{mediaId}/covers/{coverId}.`
- `covers/get-cover.test.ts` — same for the single-cover response.
- `banners/list-banners.test.ts` and `banners/get-banner.test.ts` — analogous.
- `covers/create-covers.test.ts` — upload a GIF and assert the stored row's
  `extension` is `gif` and the returned/subsequently-fetched URL ends in
  `.gif`. **This is the test that proves the whole plan.** If the existing
  create-cover test fixtures have no GIF, add one rather than skipping this.

**Verify**: `pnpm test:integration -- covers` and
`pnpm test:integration -- banners` → all pass.

### Step 9: Full gate

**Verify**: `pnpm format` → 0; `pnpm lint` → 0; `pnpm test:unit` → pass;
`pnpm test:integration` → pass.

## Test plan

- **New tests**: URL presence on all four read surfaces; the GIF round-trip on
  create. Listed per-surface in step 8.
- **Structural pattern**: `apps/api/src/__integration-tests__/chapters/get-chapter.test.ts`.
- **Regression to protect**: existing cover/banner responses keep every field
  they had. Adding `url` is additive; removing or renaming anything is not.
- **Verification**: `pnpm test:integration` → all pass.

## Done criteria

ALL must hold:

- [ ] `pnpm lint` exits 0
- [ ] `pnpm format` exits 0
- [ ] `pnpm -F db kysely migrate latest` then `migrate down` then `migrate latest` all exit 0
- [ ] `pnpm -F db kysely seed run` exits 0
- [ ] `pnpm test:unit` exits 0
- [ ] `pnpm test:integration` exits 0, including the GIF round-trip test
- [ ] `grep -rn '"extension"' apps/api/src/handlers/` shows `extension` only in
      `.select([...])` lists, never in a response Zod schema
- [ ] `git status --porcelain` lists only files from the In-scope list
- [ ] `plans/README.md` status row for 002 updated

## STOP conditions

Stop and report back (do not improvise) if:

- The target database contains production data (step 1). The `'jpg'` backfill
  is only safe on seeded data.
- `publicBase` / `S3_PUBLIC_URL` do not exist in `packages/s3` — plan 001 is a
  hard dependency.
- `extensionForMimeType` returns anything other than `"gif" | "jpg"` — the
  check constraint in step 2 assumes exactly those two values.
- The migration is not cleanly reversible.
- You find yourself needing to change `getCoverKey` / `getBannerKey`
  signatures, or to touch `get-media-document.ts` / trigger a reindex.

## Maintenance notes

- **For the reviewer**: the one thing worth real scrutiny is step 5 — the
  extension used for the S3 key and the extension written to the row must come
  from the *same* expression. If they are computed twice, a future edit can
  desynchronize them and produce rows whose URL 404s. The hoisted `const
  extension` is the guard; check it did not get duplicated back.
- **Interaction**: staff images (`getStaffImageKey`, `create-staff-handler.ts:80`)
  have the identical latent bug and are deliberately not fixed here. When
  someone builds a staff page, this plan is the template.
- **Interaction**: if the search document ever needs a cover URL rather than a
  cover id, it will need `extension` in `get-media-document.ts` and a full
  reindex (`pnpm -F scripts cli init-meilisearch`).
- **Deferred deliberately**: image resizing / thumbnail variants. Every grid in
  the product will want a smaller cover than the original. The URL helpers
  added here are the seam where a width parameter would go.
