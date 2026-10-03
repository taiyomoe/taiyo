# Engineering notes

## Library writes touch the search index

`PUT /users/me/library/:mediaId` and `DELETE /users/me/library/:mediaId` both
register an `afterCommit(syncMedia)` callback. This looks out of place — a
bookmark is a user-scoped write and has nothing to do with the media itself —
but it is load-bearing.

`MediaDocument` carries two popularity signals:

- `libraryCount` — how many rows `userLibraryEntries` holds for the media.
- `chapterCount` — how many non-deleted `chapters` rows it has, across every
  language.

Both are derived at document-build time by `getMediaDocument`, not stored on
`medias`. They are registered as sortable, filterable and displayed attributes
in `init-medias-index.ts`, and `mediaSortSchema` exposes them as public sort
fields, so "popular" and "most chapters" browse orderings read straight off
them.

`chapterCount` needs no extra wiring: chapter create, update and delete already
sync the media. `libraryCount` did — nothing on the library path touched search
before, so the count would have been correct the moment a document was built
and stale from the next bookmark onwards.

**Do not delete those two `afterCommit` calls.** They are not a stray search
write in a library handler; removing them silently freezes popularity ranking
at whatever the last media-side edit produced. The integration test in
`apps/api/src/__integration-tests__/library/library-search-freshness.test.ts`
exists to catch exactly that.

### The scaling trade-off

`syncMedia` rebuilds the whole document — it re-queries titles, covers, staff
and chapters and re-serializes all of it — to change one integer. That is
accepted deliberately: it is the same call the other 13 mutation handlers make,
it needs no new infrastructure, and bookmark volume is low.

When it becomes hot, prefer a partial Meilisearch update (`updateDocuments`
with just `{ id, libraryCount }`) over moving the recompute onto a schedule.
The partial update keeps the count exact; an hourly job on
`apps/worker/src/maintenance.ts` would make popularity lag by up to an hour and
would cost a new `@taiyomoe/search` dependency edge for `apps/worker`, which it
does not have today.

### Known gap

Neither count is content-rating aware, and search currently returns every
content rating unconditionally. Once per-user content-rating filtering lands,
decide whether "popular" is computed per-audience or globally — a globally
ranked NSFW title surfacing on a filtered browse page is the failure mode.
