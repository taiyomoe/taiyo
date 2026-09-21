# Plan 005: Build the browse → detail → read vertical slice in `apps/web`

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 458557fb..HEAD -- apps/web packages/ui/src/components/icons.tsx`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition. Note that plans 001–004 are expected
> to have changed the API side — that is not drift, that is their output.

## Status

- **Priority**: P1
- **Effort**: L
- **Risk**: MED
- **Depends on**: `plans/001-chapter-page-urls.md`,
  `plans/002-cover-and-banner-urls.md`,
  `plans/003-web-api-data-layer.md`,
  `plans/004-latest-chapters-feed.md` — **all four must be DONE first**
- **Category**: direction
- **Planned at**: commit `458557fb`, 2026-09-21

## Why this matters

This is the plan the other four exist to make possible: the first time a user
can open Taiyō and actually read a chapter.

As of commit `458557fb`, `apps/web` has six routes — a landing page, two auth
forms, and three legal pages — and none of them fetch anything. Meanwhile
`packages/ui` ships 54 components with 53 Storybook stories, and `apps/api`
ships 74 handlers. **The design system is finished and the backend is
finished; the product is the missing middle.**

Plans 001–004 supply the four missing pieces of contract (page URLs, cover
URLs, a typed client, feed endpoints). This plan spends them.

## Prerequisite check — run this before anything else

```bash
grep -rn "getChapterPageUrl" packages/s3/src/index.ts          # plan 001
grep -rn "getCoverUrl"       packages/s3/src/index.ts          # plan 002
ls apps/web/src/lib/api.ts apps/web/src/lib/api-types.d.ts     # plan 003
grep -rn "listLatestChaptersHandler" apps/api/src/routers/chapters-router.ts  # plan 004
```

All four must succeed. If any fails, **STOP** — this plan's premise is that the
API already returns image URLs and that a typed client exists.

## Current state

### Routes today

`apps/web/src/routes/`: `__root.tsx`, `index.tsx` (landing), `auth/sign-in.tsx`,
`auth/sign-up.tsx`, `terms.tsx`, `privacy.tsx`, `dmca.tsx` — plus `titles.tsx`
if plan 003 landed. That is the complete list.

`apps/web/src/routeTree.gen.ts` is **generated and committed**; it is marked
read-only in `.vscode/settings.json` and regenerates on dev/build. Never
hand-edit it.

### What `apps/web` already has that you must reuse

- `src/components/fields/form-field.tsx` — the react-hook-form ↔ `@taiyomoe/ui`
  bridge. The only generic form glue; do not write a second one.
- `src/components/legal/legal-page.tsx` — exports a `prose` StyleX style set.
- `src/components/landing/**` — the landing page. **Do not modify it.** Its
  `landing-nav.tsx` is landing-specific and reads from the brand *scene*
  palette (`src/components/scene/scene.stylex.ts`), which is deliberately
  outside the semantic tokens. Your app nav is a different component.
- `src/components/landing/cover-art.tsx:7` — *"Deterministic gradient
  placeholders until real cover images are wired in."* That comment describes
  exactly what this plan retires for the app surfaces. Leave the landing page's
  own usage alone.

### What `packages/ui` already has that covers most of this plan

Confirmed present (all importable by path, no barrel): `Sidebar` (full app
shell with provider/rail/inset/collapsible), `Card`, `Frame`, `Skeleton`,
`SidebarMenuSkeleton`, `Pagination`, `Tabs`, `Breadcrumb`, `Table`,
`ToggleGroup`, `Slider`, `Select`, `Sheet`, `Drawer`, `ScrollArea`, `Toast`
(+`toastManager`, `ToastProvider`), `Empty`, `PreviewCard` (hover-preview —
this is the cover-hover primitive, already built), `Avatar`, `Menu`, `Command`
/ `CommandDialog`, `Combobox`, `Autocomplete`, `Progress`, `Meter`, `Spinner`,
`Button`, `Badge`, `Separator`, `Tooltip`, `Popover`, `Dialog`.

**You are composing, not building primitives.** If you catch yourself writing a
generic overlay, list or button, stop and find the existing one.

What does **not** exist and you will create (in `apps/web`, not `packages/ui`,
matching the `landing-*` / `auth-*` precedent for domain components): an app
nav, a media card, a cover grid, a chapter-list row, and the reader viewport.

### The one `packages/ui` change you are allowed

`packages/ui/src/components/icons.tsx:41-114` exports exactly 18 icons, all
chrome-level: `ChevronDown/Up/Left/Right`, `ChevronsUpDown`, `Close`, `Search`,
`Plus`, `Minus`, `Ellipsis`, `PanelLeft`, `Check`, `Enter`, `Spinner`,
`AlertCircle`, `AlertTriangle`, `CheckCircle`, `Info`.

There is no bookmark, star, eye, filter, grid/list, fullscreen, settings, user
or book icon. **Every icon in this repo is sourced from
`@hugeicons/core-free-icons` and re-exported through that one file** — never
import `@hugeicons/*` directly in `apps/web`. Add the icons you need there, in
the existing style, and nowhere else.

### Styling rules — non-negotiable

**Read `packages/ui/STYLEX.md` before writing any component.** Summary of what
binds you:

- StyleX is the only styling layer. No utility classes, no CSS modules, no
  inline `style` objects. Tailwind was removed monorepo-wide in commit
  `199b70b2`.
- Tokens come from `@taiyomoe/ui/styles/tokens.stylex`. Do not hardcode colors.
- Components accept caller overrides through an `sx` prop, which merges last
  and therefore wins. See `packages/ui/README.md`.
- Shared style recipes live in `packages/ui/src/styles/recipes.ts` — check
  there before writing a repeated pattern.
- Nested radii are concentric: an inner element's radius is the outer radius
  minus the padding between them. A multi-part chip gets one surface, not one
  per part.
- `apps/web/src/styles.css` is reserved for what StyleX cannot own (global
  `@keyframes`, the handful of descendant rules reaching into `@taiyomoe/ui`
  internals). Do not add component styling there.

**Critical verification gap**: `oxlint` and `tsc` do **not** see StyleX compile
errors — the compiler only runs in the bundler. A file can pass `pnpm lint`
and still fail to build. This is why step 7's build check is mandatory and not
optional.

### Internationalization

`apps/web` uses paraglide, and 20 files already import
`import { m } from "@/paraglide/messages"`. **Every user-visible string in this
plan goes into `apps/web/messages/en.json` and is read through `m`.** Do not
hardcode English in JSX — `apps/web/src/routes/index.tsx:13` is the pattern.

Locale is `en` only (`apps/web/project.inlang/settings.json`), there is no URL
locale segment, and `__root.tsx:36` hard-codes `lang="en"`. Do not try to fix
that here; just don't make it worse by adding untranslated strings.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Install | `pnpm install` | exit 0 |
| Lint + typecheck | `pnpm lint` | exit 0 |
| Format check / fix | `pnpm format` / `pnpm format:fix` | exit 0 |
| Workspace deps | `pnpm lint:ws` | exit 0 |
| Dead code | `pnpm knip` | exit 0 |
| Compile messages | `pnpm -F web compile:messages` | exit 0 |
| Start infra | `docker compose up -d` | services healthy |
| Migrate + seed | `pnpm -F db kysely migrate latest && pnpm -F db kysely seed run` | exit 0 |
| Run API | `pnpm -F api dev` | listening on :3002 |
| Run web | `pnpm -F web dev` | listening on :3000 |
| **Build web (the real StyleX gate)** | `pnpm -F web build` | exit 0 |
| Storybook (only if you touch `packages/ui`) | `pnpm -F storybook build` | exit 0 |
| Unit tests | `pnpm test:unit` | all pass |

## Scope

**In scope**:

- `apps/web/src/routes/_app.tsx` (create — pathless layout route for the shell)
- `apps/web/src/routes/_app/titles.tsx` (browse grid; replaces plan 003's
  throwaway `titles.tsx` — delete that file)
- `apps/web/src/routes/_app/titles.$mediaId.tsx` (media detail)
- `apps/web/src/routes/read.$mediaId.$chapterId.tsx` (reader — deliberately
  *outside* `_app`, see step 5)
- `apps/web/src/components/app/**` (create — app nav, user menu placeholder)
- `apps/web/src/components/media/**` (create — media card, cover grid, chapter row)
- `apps/web/src/components/reader/**` (create — reader viewport and chrome)
- `apps/web/src/lib/api.ts` (add query options / helpers only)
- `apps/web/messages/en.json`
- `packages/ui/src/components/icons.tsx` (icon additions only)
- `apps/web/src/routeTree.gen.ts` (regenerated, committed, never hand-edited)

**Out of scope** (do NOT touch):

- Anything under `apps/api/src/` or `packages/db/`. If an endpoint is missing a
  field you need, **report it** — do not add it here. That is a separate
  reviewed change.
- `apps/web/src/components/landing/**`, `.../auth/**`, `.../scene/**` and
  `apps/web/src/routes/{index,terms,privacy,dmca,auth/*}.tsx`.
- `apps/web/src/routes/__root.tsx` beyond what plan 003 already changed. In
  particular do **not** touch `darkModeClassName` (`__root.tsx:11`) — light
  theme exists in `packages/ui/src/styles/themes.ts` but wiring a theme toggle
  is its own piece of work.
- Any `packages/ui/src/components/ui/*.tsx` file. Icons only.
- Authentication: no session provider, no route guards, no protected routes.
  Every route in this plan is public. Library buttons, bookmarks and reading
  progress are **explicitly deferred** — see Maintenance notes.
- `apps/web/src/styles.css`.

## Git workflow

- Branch: `advisor/005-reader-vertical-slice` off the branch containing 001–004.
- Conventional Commits. Commit per step — this plan is large and a per-step
  history is what makes it reviewable. Suggested final subject:
  `feat(web): add the browse, media detail and reader surfaces`.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Add the icons you need

In `packages/ui/src/components/icons.tsx`, add the icons this plan requires,
matching the existing export style exactly. At minimum: `Bookmark`, `Star`,
`Filter`, `Grid`, `List`, `Fullscreen`, `Settings`, `User`, `Book`.

Add only what you will actually use in this plan. An unused export will fail
`pnpm knip`.

**Verify**: `pnpm lint` → 0; `pnpm knip` → 0.

### Step 2: Build the app shell layout route

Create `apps/web/src/routes/_app.tsx` — a pathless layout route rendering an
`<Outlet />` inside the app chrome:

- A top nav: the Taiyō logo (`@taiyomoe/ui/components/logos/taiyo-logo`), a
  search entry point, and a sign-in link. The nav is a **new component** in
  `apps/web/src/components/app/`; do not reuse or modify `landing-nav.tsx`.
- Compose `Sidebar` from `@taiyomoe/ui/components/ui/sidebar` for navigation
  (Home / Titles / Latest). It ships its own provider, rail and collapsible
  behavior — use them rather than reimplementing.
- A route-level `errorComponent` and `pendingComponent` so every child route
  inherits sane failure and loading states.

The existing `/` landing route stays outside `_app` and keeps its own
`LandingNav`.

**Verify**: `pnpm -F web dev` → `http://localhost:3000/` still renders the
landing page unchanged; `pnpm -F web build` → exit 0.

### Step 3: Build the browse grid

Create `apps/web/src/routes/_app/titles.tsx`, replacing plan 003's throwaway
route (delete `apps/web/src/routes/titles.tsx`).

- Loader calls `POST /medias/search` through the typed client with pagination
  from search params, so the URL is shareable and back/forward works.
- Renders a responsive cover grid of `MediaCard`s
  (`apps/web/src/components/media/media-card.tsx`): cover image from the `url`
  field plan 002 added, main title, type and status badges (`Badge`), and a
  content-rating pill.
- Wrap each card in `PreviewCard` for the hover preview — it already exists and
  is exactly this primitive.
- Loading state: a `MediaCardSkeleton` built from
  `@taiyomoe/ui/components/ui/skeleton`, rendered in the `pendingComponent`.
  Match the card's real dimensions so the layout does not shift.
- Empty state: `Empty` from `@taiyomoe/ui/components/ui/empty`.
- Pagination: `Pagination` from `@taiyomoe/ui/components/ui/pagination`, driven
  by the `meta` envelope (`page`, `perPage`, `total`).
- Cover images need `loading="lazy"` and explicit width/height to avoid layout
  shift.

**Do not build a filter panel in this plan.** The search endpoint supports 21
filter fields and that surface deserves its own design pass; see Maintenance.

**Verify**: `pnpm -F web build` → 0; with infra + API + web running,
`curl -s http://localhost:3000/titles | grep -c "<img"` → > 0 (covers are
server-rendered, not client-only).

### Step 4: Build the media detail page

Create `apps/web/src/routes/_app/titles.$mediaId.tsx`.

- Loader calls `GET /medias/:id` (titles, covers, banners, staff) and
  `GET /medias/:id/chapters` in parallel.
- Hero: banner image (`url` from plan 002) with the main cover overlaid,
  main title, synopsis, status/type/demography badges, and staff credits.
- Chapter list: a `ChapterRow` component per chapter
  (`apps/web/src/components/media/chapter-row.tsx`) showing number, volume,
  title, language and the scanlation groups. Each row links to the reader route.
- Paginate the chapter list with `Pagination`.
- `notFoundComponent` for an unknown media id.

**Verify**: `pnpm -F web build` → 0; navigating from `/titles` to a card opens
the detail page with a populated chapter list.

### Step 5: Build the reader

Create `apps/web/src/routes/read.$mediaId.$chapterId.tsx`.

This route is deliberately **outside** the `_app` layout: the reader is a
full-bleed surface and must not inherit the nav and sidebar chrome. That is the
reason for its top-level path — do not "fix" it by moving it under `_app`.

- Loader calls `GET /chapters/:id`, which after plan 001 returns
  `pages: { id, url }[] | null` in reading order.
- Long-strip mode only in this plan: pages stacked vertically, full width,
  capped at a readable max-width. **Do not build paged or double-page modes
  here** — mode switching needs persisted user settings, which do not exist.
- Preload the next 2–3 page images so scrolling does not stall.
- Keyboard navigation: `←` / `→` (or `j` / `k`) move between chapters; `Esc`
  returns to the media detail page. Use
  `@taiyomoe/ui/components/ui/kbd` if you surface the shortcuts in UI.
- Reader chrome: a `Toolbar` (`@taiyomoe/ui/components/ui/toolbar`) that
  auto-hides on scroll, carrying the chapter title, a prev/next chapter control
  and a progress indicator (`Progress`).
- Handle `pages: null` (nothing uploaded yet) with `Empty`, not a crash.
- Every page `<img>` needs explicit dimensions or an aspect-ratio box —
  a 200-page chapter without them will thrash layout.

**Do not call `POST /chapters/:id/open` or
`PATCH /chapters/:id/history`.** Both require a session, and session wiring is
out of scope. Reading progress is deferred; see Maintenance notes.

**Verify**: `pnpm -F web build` → 0; the reader renders all pages of a seeded
chapter; keyboard nav works; `pages: null` renders the empty state.

### Step 6: Wire the home feed

Change `apps/web/src/routes/index.tsx` so the landing page's hero is followed
by a "Latest chapters" strip fed by `GET /chapters/latest` (plan 004).

Keep every existing landing section intact and in order. This is an addition
below the existing content, not a rewrite. Reuse `ChapterRow` from step 4.

**Verify**: `curl -s http://localhost:3000/ | grep -c "chapter"` → > 0, and the
landing page's existing sections all still render.

### Step 7: The StyleX build gate

`pnpm lint` does **not** catch StyleX compile errors. Run, in order:

```bash
pnpm format
pnpm lint
pnpm lint:ws
pnpm knip
pnpm -F web compile:messages
pnpm -F web build
pnpm test:unit
```

If you touched `packages/ui/src/components/icons.tsx`, also run
`pnpm -F storybook build`.

Watch the build output for `Unexpected 'stylex.create' call` — that message
means a StyleX constraint was violated even though lint passed.

**Verify**: every command exits 0.

### Step 8: Look at it

Run the app and actually view each surface at a desktop and a mobile viewport:
`/`, `/titles`, `/titles/<seeded-media-id>`, `/read/<mediaId>/<chapterId>`.

Check against `packages/ui/STYLEX.md`'s design language: concentric nested
radii, roomy rows, muted glyphs, one surface per multi-part chip. Report what
you saw. "It compiles" is not the bar.

## Test plan

Vitest runs from the root (`vitest.config.unit.ts` globs `**/__tests__/**`);
`apps/web` defines no local test script — do not add one.

- **New unit tests** under `apps/web/src/components/**/__tests__/`:
  - the media-card props → rendered-title/badge mapping,
  - the chapter-row label formatting (volume + number + language, including the
    null-volume and null-title cases),
  - the reader's page-preloading index math (which indices are preloaded at
    position N, including at the first and last page).
  Test the pure logic; do not attempt to render a full route.
- **Structural pattern**: `packages/utils/src/__tests__/extension-for-mime-type.test.ts`.
- **Not unit-tested**: SSR, layout, and image loading. Those are covered by the
  `curl` assertions in steps 3 and 6 and the manual pass in step 8. Report
  those results explicitly.
- **Verification**: `pnpm test:unit` → all pass.

## Done criteria

ALL must hold:

- [ ] `pnpm format` exits 0
- [ ] `pnpm lint` exits 0
- [ ] `pnpm lint:ws` exits 0
- [ ] `pnpm knip` exits 0
- [ ] `pnpm -F web build` exits 0 with no `stylex` warnings in the output
- [ ] `pnpm test:unit` exits 0, including the new component tests
- [ ] `pnpm -F storybook build` exits 0 (only required if `icons.tsx` changed)
- [ ] `curl -s http://localhost:3000/titles | grep -c "<img"` returns > 0
- [ ] The reader renders every page of a seeded chapter (state the chapter id
      you checked in your report)
- [ ] `grep -rn "@hugeicons" apps/web/src` returns **no matches** — icons come
      only from `@taiyomoe/ui/components/icons`
- [ ] `grep -rn "className=" apps/web/src/components/{app,media,reader}` returns
      no hardcoded utility classes
- [ ] `apps/web/src/routes/titles.tsx` (plan 003's throwaway) no longer exists
- [ ] `git status --porcelain` lists only files from the In-scope list
- [ ] `plans/README.md` status row for 005 updated

## STOP conditions

Stop and report back (do not improvise) if:

- Any of the four prerequisite checks at the top of this plan fails.
- `GET /chapters/:id` does not return a `url` per page, or `GET /medias/:id`
  does not return cover/banner URLs. That means 001/002 did not land as
  specified; do not reconstruct URLs client-side from ids and a guessed base
  URL — that is the exact anti-pattern those plans exist to prevent.
- You need a field the API does not return. Report the specific endpoint and
  field. Do not edit `apps/api`.
- `pnpm -F web build` fails with a StyleX error you cannot resolve within the
  documented constraints in `packages/ui/STYLEX.md` §"What StyleX 0.19 + this
  repo's lint allow".
- You find yourself needing a session, a logged-in user, or a protected route.
  Everything in this plan is public by construction.
- The reader's page count for a real chapter exceeds ~200 and naive rendering
  becomes unusable. Virtualization is a real need but a separate decision —
  report it rather than adding a virtualization dependency here.

## Maintenance notes

- **For the reviewer**: the two things most likely to be wrong are (1) hardcoded
  strings that bypass paraglide, and (2) icons imported straight from
  `@hugeicons/react` instead of through `@taiyomoe/ui/components/icons`. Both
  are cheap to grep — the Done criteria include those greps for that reason.
  Also confirm the reader route really is outside `_app`; it is easy to
  "tidy" it into the layout and silently reintroduce the nav over a full-bleed
  reader.
- **Deliberately deferred — session and everything that needs it.** No
  bookmark button, no library status control, no reading-progress sync, no user
  menu. The API is ready for all of them (`PUT /users/me/library/:mediaId`,
  `POST /chapters/:id/open`, `PATCH /chapters/:id/history`,
  `GET /users/me/lists`), but `apps/web` has no `useSession` call, no session
  provider and no route guard anywhere, and SSR cookie forwarding is unsolved.
  That is the natural next plan after this one.
- **Deliberately deferred — the filter panel.** `POST /medias/search` accepts
  21 filter fields and 5 sort keys, and `packages/search` ships the filter
  translator. A faceted browse UI is the obvious next feature, and it would be
  much better with facet *counts* — which the API does not return today
  (no `facetDistribution`; recorded in `plans/README.md`).
- **Deliberately deferred — content-rating gating.** The API returns
  `contentRating` (up to `NSFL`) and `flag` on medias, covers and chapters, and
  **enforces neither**. `packages/db/src/json-types.ts:18-24` defines a
  per-user `contentRating` preference that no handler reads. This slice renders
  whatever it is given. Before any public launch, that gap must close on the
  API side first — a client-side blur is not access control.
- **Watch in review**: `defaultPreload: "intent"` (`apps/web/src/router.tsx`)
  fires loaders on hover. On a grid of cards that is a lot of requests, and
  `POST /medias/search` is rate-limited to 60/min. Confirm `staleTime` is set.
