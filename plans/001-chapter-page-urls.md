# Plan 001: Return resolvable page image URLs from `GET /chapters/:id`

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 458557fb..HEAD -- apps/api/src/handlers/get-chapter-handler.ts packages/s3/src apps/api/.env.example packages/queue/src/processor.ts`
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

Taiyō is a manga *reading* platform. The chapter-page upload pipeline is
complete and integration-tested: pages are validated, transcoded to JPEG by
`sharp`, and written to S3 at a canonical key. But **nothing can read them
back**. `GET /chapters/:id` returns `pages` as bare UUIDs, and there is no
public base URL anywhere in the repo — not in any `.env.example`, not in
`packages/config`, not in `packages/s3`. The S3 key helper
`getChapterPageKey` has exactly one importer in the entire monorepo: the
writer.

The result is that the single act the product exists for has no API. Until a
client can turn a page id into an image URL, the reader UI cannot be built and
the whole upload pipeline is write-only storage.

This plan makes chapter pages addressable. It deliberately does **not** touch
covers or banners — those need a schema change and are handled by plan 002.

## Current state

Files involved:

- `packages/s3/src/env.ts` — `@t3-oss/env-core` schema for the S3 package. Has
  four vars; no public/CDN base URL.
- `packages/s3/src/index.ts` — S3 client factory and the key-derivation
  helpers. Contains `getChapterPageKey` but no URL helper.
- `apps/api/src/handlers/get-chapter-handler.ts` — the route to change.
- `apps/api/.env.example` — documents every server-side var.

### `packages/s3/src/index.ts:52-54` (the canonical key — do not change it)

```ts
/** Canonical key for a finished, processed chapter page. Always .jpg. */
export const getChapterPageKey = (mediaId: string, chapterId: string, pageId: string) =>
  `medias/${mediaId}/chapters/${chapterId}/${pageId}.jpg`
```

The `.jpg` suffix is unconditional because `packages/queue/src/processor.ts`
transcodes every page through `sharp().rotate().jpeg()` before writing it.
This is why chapter pages — unlike covers and banners — need no stored file
extension.

### `packages/s3/src/env.ts:12-19` (current server schema)

```ts
  server: {
    S3_ENDPOINT: z.url(),
    S3_ACCESS_KEY_ID: z.string().min(1),
    S3_SECRET_ACCESS_KEY: z.string().min(1),
    S3_BUCKET_NAME: z.string().min(1),
  },
```

Note: this file also declares `clientPrefix: "NEXT_PUBLIC_"` and carries
scaffold comments mentioning Next.js. **Leave those alone** — they are
pre-existing and out of scope here.

### `apps/api/src/handlers/get-chapter-handler.ts:18-22` (the response field to change)

```ts
  pages: z
    .object({ id: z.uuid() })
    .array()
    .nullable()
    .meta({ description: "Page references, if any have been uploaded." }),
```

### `apps/api/src/handlers/get-chapter-handler.ts:45-61` (the handler body)

```ts
  checkChapter(),
  async (c) => {
    const { chapter } = c.var

    return c.ok({
      id: chapter.id,
      mediaId: chapter.mediaId,
      title: chapter.title,
      number: chapter.number,
      volume: chapter.volume,
      language: chapter.language,
      contentRating: chapter.contentRating,
      flag: chapter.flag,
      pages: chapter.pages,
      createdAt: chapter.createdAt,
      updatedAt: chapter.updatedAt,
    })
  },
```

`chapter.pages` is typed as `{ id: string }[] | null` and is written by
`packages/queue/src/processor.ts:75-79`.

### Repo conventions you must match

This repo has a written convention for API routes. **Read
`.agents/skills/create-backend-route/SKILL.md` before editing the handler.**
The rules that bind this plan:

- Every schema field gets `.meta({ description, example })`. Examples must be
  realistic.
- Route `description` prose is written for the API consumer and **must never
  leak internals** — do not mention S3, buckets, keys, transcoding, or
  "we store". Say what the consumer gets.
- Response descriptions are noun-form and short: `"Chapter details."`, not
  `"Returns the chapter details successfully."`
- Every route description ends with a permissions footer. This route is
  public, so the existing `**Authentication:** none.` stays.

Exemplar to match for schema style: `apps/api/src/handlers/get-media-handler.ts`.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Install | `pnpm install` | exit 0 |
| Lint + typecheck (this repo has no separate `tsc`) | `pnpm lint` | exit 0, no errors |
| Format check | `pnpm format` | exit 0 |
| Format fix | `pnpm format:fix` | rewrites in place |
| Unit tests | `pnpm test:unit` | all pass |
| Integration tests (needs `docker compose up -d`) | `pnpm test:integration` | all pass |
| Single integration file | `pnpm test:integration -- chapters/get-chapter` | all pass |

`pnpm lint` is the type gate — oxlint runs with `typeAware: true` and
`typeCheck: true`. There is no `tsc --noEmit` step.

## Scope

**In scope** (the only files you should modify):

- `packages/s3/src/env.ts`
- `packages/s3/src/index.ts`
- `apps/api/.env.example`
- `apps/api/src/handlers/get-chapter-handler.ts`
- `apps/api/src/__integration-tests__/chapters/get-chapter.test.ts`
- `turbo.json` (one added entry in `globalEnv`)

**Out of scope** (do NOT touch, even though they look related):

- `packages/queue/src/processor.ts` — the writer. The key format is correct;
  changing it would orphan every page already uploaded.
- `apps/api/src/handlers/list-chapters-handler.ts` — deliberately omits `pages`
  so chapter lists stay small. Keep it that way.
- Covers, banners, staff images — they need a persisted file extension
  (`.gif` vs `.jpg`) and are plan 002's job. Do not add URL fields to
  `get-media-handler.ts`, `list-covers-handler.ts` or any banner handler.
- `packages/s3/src/env.ts`'s `clientPrefix: "NEXT_PUBLIC_"` and its scaffold
  comments — pre-existing, unrelated.
- Access control on `chapter.flag` / `contentRating` — the route is public
  today and stays public in this plan.

## Git workflow

- Branch: `advisor/001-chapter-page-urls` off `rewrite`.
- Conventional Commits, matching `git log`. Example from this repo:
  `feat(web): add real terms, privacy and DMCA pages`.
  Use `feat(api): return resolvable page urls from the chapter endpoint`.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Add `S3_PUBLIC_URL` to the S3 package env schema

In `packages/s3/src/env.ts`, add one entry to the `server` object:

```ts
    S3_PUBLIC_URL: z.url(),
```

Place it after `S3_BUCKET_NAME`. Do not change anything else in the file.

**Verify**: `pnpm lint` → exit 0.

### Step 2: Document the variable

In `apps/api/.env.example`, extend the existing `# S3` block so it reads:

```dotenv
# S3
S3_ENDPOINT="http://localhost:9000"
S3_ACCESS_KEY_ID="taiyo"
S3_SECRET_ACCESS_KEY="root-password"
S3_BUCKET_NAME="taiyo"
# Public base URL images are served from (CDN in production, the RustFS
# endpoint + bucket locally). No trailing slash.
S3_PUBLIC_URL="http://localhost:9000/taiyo"
```

Then add `"S3_PUBLIC_URL"` to the `globalEnv` array in `turbo.json` (it
currently lists `DATABASE_URL`, `VITE_BETTER_AUTH_URL`, … — append to that
list, keeping the existing entries untouched).

**Verify**: `grep -n "S3_PUBLIC_URL" apps/api/.env.example turbo.json` → one
match in each file.

### Step 3: Add the URL helper next to the key helper

In `packages/s3/src/index.ts`, immediately below `getChapterPageKey`, add:

```ts
/** Public URL of a finished, processed chapter page. */
export const getChapterPageUrl = (mediaId: string, chapterId: string, pageId: string) =>
  `${env.S3_PUBLIC_URL}/${getChapterPageKey(mediaId, chapterId, pageId)}`
```

`env` is already imported at the top of the file (`import { env } from "./env"`).
Do not add a second import.

Normalize defensively: if `env.S3_PUBLIC_URL` may carry a trailing slash, strip
it once at module scope rather than per call:

```ts
const publicBase = env.S3_PUBLIC_URL.replace(/\/+$/, "")
```

and use `publicBase` in the template.

**Verify**: `pnpm lint` → exit 0.

### Step 4: Surface the URL on the chapter detail response

In `apps/api/src/handlers/get-chapter-handler.ts`:

1. Add the import: `import { getChapterPageUrl } from "@taiyomoe/s3"`.
   (`@taiyomoe/s3` is already a dependency of `apps/api` — confirm with
   `grep -n '"@taiyomoe/s3"' apps/api/package.json`.)

2. Change the `pages` field in `chapterDetailSchema` to:

```ts
  pages: z
    .object({
      id: z.uuid().meta({
        description: "The ID of the page.",
        example: "13548c83-8d1a-4163-8830-c8f16fcd2eb7",
      }),
      url: z.url().meta({
        description: "URL of the page image.",
        example:
          "https://cdn.taiyo.moe/medias/4e26b80f-6661-4f5f-93b4-6dfed052bbed/chapters/13548c83-8d1a-4163-8830-c8f16fcd2eb7/9f1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d.jpg",
      }),
    })
    .array()
    .nullable()
    .meta({ description: "The pages of the chapter, in reading order." }),
```

3. In the handler body, replace `pages: chapter.pages,` with:

```ts
      pages:
        chapter.pages?.map((page) => ({
          id: page.id,
          url: getChapterPageUrl(chapter.mediaId, chapter.id, page.id),
        })) ?? null,
```

Keep the `null` case — a chapter with no uploaded pages must still return
`null`, not `[]`, so the response shape is unchanged for existing consumers.

4. Update the route `description` to mention the new field **without leaking
   internals**. Replace:

```ts
    description: "Fetches a chapter by id.\n\n**Authentication:** none.",
```

with:

```ts
    description:
      "Fetches a chapter by id, including its pages in reading order.\n\n**Authentication:** none.",
```

**Verify**: `pnpm lint` → exit 0, and
`pnpm format` → exit 0 (run `pnpm format:fix` first if it complains).

### Step 5: Extend the integration test

`apps/api/src/__integration-tests__/chapters/get-chapter.test.ts` already
covers the happy path, `CHAPTER_NOT_FOUND`, and `VALIDATION_ERROR`. Follow its
existing structure exactly — same `describe`/`test` imports from
`../helpers/request` and `../setup`, same `res.body.success` narrowing.

Extend the `ChapterDetail` type in that file to include
`pages: { id: string; url: string }[] | null`, then add one test:

```ts
  test("returns a resolvable url for every page", async ({ app }) => {
    const res = await api<ChapterDetail>(app, `/chapters/${SEEDED_CHAPTER_ID}`)

    expect(res.status).toBe(200)

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    const { pages } = res.body.data

    expect(pages).not.toBeNull()
    expect(pages!.length).toBeGreaterThan(0)

    for (const page of pages!) {
      expect(page.url).toContain(
        `/medias/${SEEDED_MEDIA_ID}/chapters/${SEEDED_CHAPTER_ID}/${page.id}.jpg`,
      )
    }
  })
```

The seeded chapter `13548c83-8d1a-4163-8830-c8f16fcd2eb7` is defined at
`packages/db/src/seeds/medias/media-1.ts:396-403` and already has a populated
`pages` array (first page id `69a8a430-69fb-4ba2-b0d1-78b14bd111ce`), so this
test has real data to assert against. Verify with
`sed -n '395,405p' packages/db/src/seeds/medias/media-1.ts` before writing it.

**Verify**: `docker compose up -d` then
`pnpm test:integration -- chapters/get-chapter` → all tests pass, including the
new one.

### Step 6: Full gate

**Verify**: in order —
`pnpm format` → exit 0;
`pnpm lint` → exit 0;
`pnpm test:unit` → all pass;
`pnpm test:integration` → all pass.

## Test plan

- **New test**: "returns a resolvable url for every page" in
  `apps/api/src/__integration-tests__/chapters/get-chapter.test.ts`, asserting
  every page carries a `url` ending in the canonical
  `/medias/{mediaId}/chapters/{chapterId}/{pageId}.jpg` path.
- **Structural pattern**: the three existing tests in that same file.
- **Regression to protect**: a chapter with no uploaded pages must still return
  `pages: null`. If no seeded chapter has `pages: null`, do not create one —
  note it in your report instead.
- **Verification**: `pnpm test:integration -- chapters/get-chapter` → all pass.

## Done criteria

ALL must hold:

- [ ] `pnpm lint` exits 0
- [ ] `pnpm format` exits 0
- [ ] `pnpm test:unit` exits 0
- [ ] `pnpm test:integration` exits 0, including the new page-url test
- [ ] `grep -rn "getChapterPageUrl" packages/s3/src apps/api/src` returns the
      definition plus at least one call site in `get-chapter-handler.ts`
- [ ] `grep -n "S3_PUBLIC_URL" apps/api/.env.example turbo.json packages/s3/src/env.ts`
      returns one match per file
- [ ] `git status --porcelain` lists only files from the In-scope list
- [ ] `plans/README.md` status row for 001 updated

## STOP conditions

Stop and report back (do not improvise) if:

- The excerpts in "Current state" do not match the live code.
- `getChapterPageKey` no longer ends in `.jpg`, or
  `packages/queue/src/processor.ts` no longer transcodes to JPEG — the whole
  premise of this plan is that chapter pages have a fixed extension.
- `pnpm test:integration` fails for reasons unrelated to your change (e.g. the
  Docker services are not up). Report the failure; do not "fix" unrelated tests.
- You conclude the response shape change breaks an existing consumer. Search
  first: `grep -rn "pages" apps/web/src` should return nothing today.
- You find yourself wanting to add URL fields to covers or banners. That is
  plan 002 and requires a migration. Stop.

## Maintenance notes

- **For the reviewer**: check that the route description says nothing about S3,
  buckets or transcoding — the repo's route skill bans internals in
  consumer-facing prose, and this is the easiest place to slip.
- **Interaction**: when plan 002 adds cover/banner URLs, the `publicBase`
  constant and `S3_PUBLIC_URL` added here are the shared foundation. 002 should
  reuse them, not add a second env var.
- **Deferred deliberately**: access control. `chapters.flag` and
  `contentRating` are returned but not enforced — a `LOCKED` or `NSFL` chapter
  hands out page URLs to anyone. That is a real gap, tracked separately in
  `plans/README.md`; it needs the user-settings work to be done properly and
  should not be smuggled into this plan.
- **Deferred deliberately**: signed URLs. This plan assumes a public bucket /
  CDN. If the deployment later needs per-request signing, `getChapterPageUrl`
  is the single seam to change.
