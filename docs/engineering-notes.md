# Engineering notes

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
