# Plan 008: Make the privacy policy describe what Taiyō actually collects

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 458557fb..HEAD -- apps/web/src/routes/privacy.tsx apps/web/src/routes/terms.tsx apps/web/src/routes/dmca.tsx packages/db/src/database.ts`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: docs
- **Planned at**: commit `458557fb`, 2026-09-21

## Why this matters

`apps/web/src/routes/privacy.tsx` shipped in commit `458557fb`. Under
"2. What we collect", it tells users:

> **Content you submit.** Anything you upload or write — library entries,
> reading progress, uploaded pages, comments, and reports.

**Two of those five do not exist.** There is no comments feature and no
in-app reporting feature anywhere in the codebase. A privacy policy is a
statement about actual data processing; listing categories of data you do not
collect is the kind of inaccuracy that undermines the document's credibility
and, in a regulated context, its usefulness as a compliance artifact.

The fix is to describe the three things that are real. When comments or reports
ship, the policy gets updated in the same commit — that is the discipline this
plan establishes, not a one-off correction.

## Current state

### The inaccurate claim — `apps/web/src/routes/privacy.tsx:53-57`

```tsx
<p sx={prose.p}>
  <strong sx={prose.strong}>Content you submit.</strong> Anything you upload or write — library
  entries, reading progress, uploaded pages, comments, and reports.
</p>
```

### What actually exists, verified against `packages/db/src/database.ts:24-47`

The full table list is: `accounts`, `banners`, `chapterGroups`, `chapters`,
`covers`, `groupMemberships`, `groupOwnershipRequests`, `groups`,
`mediaStaffs`, `medias`, `sessions`, `staffs`, `tasks`, `titles`,
`userFollows`, `userHistories`, `userLibraryEntries`, `userListItems`,
`userLists`, `userProfiles`, `users`, `verifications`.

Mapping the policy's claims onto that:

| Claim            | Reality                                                                                                                                                                                    |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| library entries  | ✅ `userLibraryEntries`                                                                                                                                                                    |
| reading progress | ✅ `userHistories`                                                                                                                                                                         |
| uploaded pages   | ✅ `chapters.pages` + S3 objects                                                                                                                                                           |
| **comments**     | ❌ **no table.** `MediaChapterComment` existed in `packages/db/src/migrations/1780040678212_init.ts:735-753` and was dropped by `1780048678212_refactor-scans.ts:17`. Nothing replaced it. |
| **reports**      | ❌ **no table, no route.** The only moderation primitive is `POST /medias/:id/flag` (`apps/api/src/handlers/flag-media-handler.ts:24`), which is admin-initiated, not user-submitted.      |

Three further things the policy omits but the code does collect — consider
whether they belong in this section (see step 2):

- **Custom lists** — `userLists` / `userListItems`, user-created and named, with
  `PUBLIC` / `PRIVATE` visibility.
- **Follows** — `userFollows`, a social graph the user creates.
- **Group ownership requests** — `groupOwnershipRequests` stores a free-text
  `message` the user writes to justify a claim, plus a reviewer note.

### The other two legal pages are fine — verify, do not rewrite

- `apps/web/src/routes/dmca.tsx` describes an **email-based** notice process
  (`mailto:` the support address, lines 32, 51, 189). It promises no in-app
  feature, so it is accurate. Leave it alone.
- `apps/web/src/routes/terms.tsx` references the DMCA page for copyright
  complaints (lines 149, 270) and makes no claim about comments or reports.
  Leave it alone.

Confirm both yourself in step 1 rather than taking this on faith.

### How these pages are structured

All three routes pass a `sections[]` array into `<LegalPage>`
(`apps/web/src/components/legal/legal-page.tsx`), and style prose through the
exported `prose` style set (`prose.p`, `prose.strong`, `prose.a`). Text is
plain JSX, **not** paraglide messages — unlike the rest of the app, these ~740
lines of legal copy are not localized. That is the existing state; do not
change it in this plan.

## Commands you will need

| Purpose            | Command                           | Expected on success |
| ------------------ | --------------------------------- | ------------------- |
| Lint + typecheck   | `pnpm lint`                       | exit 0              |
| Format check / fix | `pnpm format` / `pnpm format:fix` | exit 0              |
| Build web          | `pnpm -F web build`               | exit 0              |
| Run web            | `pnpm -F web dev`                 | listening on :3000  |

## Scope

**In scope**:

- `apps/web/src/routes/privacy.tsx`
- `apps/web/AGENTS.md` (append the maintenance rule from step 3)

**Out of scope** (do NOT touch):

- `apps/web/src/routes/dmca.tsx` and `apps/web/src/routes/terms.tsx` — audited
  in step 1, expected to need no change. If step 1 finds an inaccuracy, report
  it; do not fix it silently in this plan.
- `apps/web/src/components/legal/legal-page.tsx` and its `prose` styles.
- Localizing the legal pages. They are deliberately untranslated today and
  making that change is its own decision.
- Building comments or a reports feature. This plan makes the document
  truthful; it does not make the claims true.
- `README.md`, which has its own staleness problem (tracked in
  `plans/README.md`). Different document, different change.

## Git workflow

- Branch: `advisor/008-legal-copy-accuracy` off `rewrite`.
- Conventional Commits. Suggested:
  `docs(web): describe only the data the privacy policy actually covers`.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Audit all three legal pages against the schema

Read `apps/web/src/routes/privacy.tsx`, `terms.tsx` and `dmca.tsx` in full.
For every concrete claim about data the Service collects, stores, or lets users
submit, find the table or route that backs it in
`packages/db/src/database.ts` and `apps/api/src/routers/`.

List your findings in your report as a table: claim → backing table/route →
✅ or ❌. This is the deliverable of the step; the edit in step 2 is the easy
part.

**Verify**: your report contains the table, covering all three files.

### Step 2: Correct the "Content you submit" paragraph

Rewrite the paragraph at `privacy.tsx:53-57` so it lists only data that exists.
Keep the existing voice — these pages are written in plain, second-person
English with no legalese padding, and they use `<strong sx={prose.strong}>` for
the lead-in term. Match that exactly.

The paragraph must:

- Drop **comments** and **reports**.
- Keep library entries, reading progress and uploaded pages.
- Add whichever of custom lists, follows and group-ownership request messages
  your step 1 audit confirms are real and user-submitted. Prefer naming them:
  they are real user content, and a policy that under-describes is a smaller
  problem than one that over-describes but still a problem.

Do not add a hedging clause like "and any other content you may submit" — that
is exactly the vagueness this change exists to remove.

**Verify**: `grep -n "comments" apps/web/src/routes/privacy.tsx` returns no
match in the "What we collect" section;
`grep -n "library entries" apps/web/src/routes/privacy.tsx` still matches.

### Step 3: Record the rule where it will be read

**Do not add a JSX comment.** This repo is moving to a comment-free source tree
(see `plans/006-comment-free-codebase.md`); a marker in `privacy.tsx` would be
deleted by that purge.

Instead, append a short subsection to `apps/web/AGENTS.md` — the doc plan 006
designates for this app's rationale — under a heading like
`## Legal pages`:

> `src/routes/{privacy,terms,dmca}.tsx` must describe only what the Service
> actually does. The "What we collect" section of `privacy.tsx` lists data
> categories and is only correct as long as those tables exist. When a feature
> that stores new user content ships (comments, reports, ratings), update that
> section in the same change; when one is removed, the same rule applies in
> reverse — this paragraph was wrong because `MediaChapterComment` was dropped
> and the copy was not revisited.

This is the durable part of the plan. The copy was wrong because a feature was
removed and nobody revisited the document; the note is what makes the inverse
less likely.

**Verify**: `grep -c "Legal pages" apps/web/AGENTS.md` → 1; `pnpm lint` → 0.

### Step 4: Check it renders

Run `pnpm -F web dev` and open `http://localhost:3000/privacy`. Confirm the
section renders and the paragraph reads naturally.

**Verify**: `pnpm format` → 0; `pnpm lint` → 0; `pnpm -F web build` → 0.

## Test plan

There are no tests for legal copy and this plan does not add any — a snapshot
test on prose would fail on every intentional wording change and teach
reviewers to ignore it.

The real verification is step 1's audit table, which is a human-reviewable
artifact. Include it in your report.

## Done criteria

ALL must hold:

- [ ] Step 1's claim → backing-table audit table is in your report, covering
      `privacy.tsx`, `terms.tsx` and `dmca.tsx`
- [ ] `grep -rn "comments" apps/web/src/routes/privacy.tsx` returns no match
      describing collected data
- [ ] `grep -rn "reports" apps/web/src/routes/privacy.tsx` returns no match
      describing collected data
- [ ] `pnpm lint` exits 0
- [ ] `pnpm format` exits 0
- [ ] `pnpm -F web build` exits 0
- [ ] `/privacy` renders correctly in the browser
- [ ] `grep -c "Legal pages" apps/web/AGENTS.md` returns 1
- [ ] `grep -rn "{/\*" apps/web/src/routes/privacy.tsx` returns no new JSX comment
- [ ] `git status --porcelain` lists only `apps/web/src/routes/privacy.tsx`
      and `apps/web/AGENTS.md`
- [ ] `plans/README.md` status row for 008 updated

## STOP conditions

Stop and report back (do not improvise) if:

- Step 1's audit finds an inaccuracy in `terms.tsx` or `dmca.tsx`. Those files
  are out of scope; report what you found so it can be scoped properly. Terms
  of service and DMCA copy carry more legal weight than a data-category list
  and should not be edited as a side effect of this plan.
- A `comments` or `reports` table exists in `packages/db/src/database.ts`. That
  would mean the feature shipped after this plan was written and the policy is
  correct — report it and make no change.
- You conclude the paragraph needs restructuring beyond the one bullet list
  (for example, splitting "Content you submit" into several paragraphs).
  Propose it; do not do it unilaterally.

## Maintenance notes

- **For the reviewer**: the only question worth asking is "is every item in
  this list backed by a table?" Step 1's audit table answers it directly.
- **This will need updating again.** Comments were part of the v1 product
  (`MediaChapterComment` in the initial migration) and may well return; a
  reports/moderation-queue table is recorded as a gap in `plans/README.md`.
  Either shipping means revisiting this paragraph — the `apps/web/AGENTS.md`
  note from step 3 exists to prompt that.
- **Related but deliberately separate**: `README.md` makes the mirror-image
  error, describing shipped features as unbuilt ("background workers are
  planned but not yet checked in" while `apps/worker` exists and runs in
  `pnpm dev`). Tracked in `plans/README.md`, not fixed here.
