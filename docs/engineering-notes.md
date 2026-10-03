# Engineering notes

Backend and infrastructure rationale that would otherwise live in source
comments. See `packages/ui/STYLEX.md` for UI/StyleX and `apps/web/AGENTS.md`
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
