# Roadmap

Maintained by hand. Edit, reorder or drop items freely; the order is not a commitment.

## Next, not scheduled

- **Feed page.** `GET /users/me/feed` is built and tested (`apps/api/src/handlers/list-my-feed-handler.ts`), but no page calls it yet. The sidebar entry still shows "Soon" (`apps/web/src/components/shell/app-sidebar.tsx`).
- **Related tab on the media page.** It renders disabled with a "Soon" badge (`apps/web/src/features/media/components/media-page/media-tabs.tsx`).

## Open decisions

- **Per-audience popularity.** `libraryCount` and `chapterCount` are global, so a popular ordering ranks across all content ratings. Decide whether to compute them per audience. See [known gap](./engineering-notes.md#known-gap).

## Later, when needed

- **Partial search updates for bookmarks and ratings.** A bookmark or a rating rebuilds the whole search document to change a few numbers. Switch to a partial update when their volume makes that hot. See [popularity signals](./engineering-notes.md#popularity-signals).
