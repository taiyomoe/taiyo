# Taiyō domain glossary

## Search

**Media document**: the denormalised record of one media in the Meilisearch `medias` index, built by `getMediaDocument` from `medias`, `titles`, `covers`, `mediaStaffs` + `staffs`, `chapters` and `userLibraryEntries`. A media with no live main title or main cover has no media document.

**Search outbox**: the `searchOutbox` table of mediaIds whose media document may be stale. Postgres triggers on the six source tables write to it inside the same transaction as the change, so no write path can skip it. The only direct writer is the forced reindex route.

**Drain**: reading pending search outbox rows and rebuilding, or removing, each media document. The API drains right after a transaction commits; the worker drains on a schedule to retry anything a failed drain left behind. A row is only removed once its media document has been pushed.

**Search freshness**: the guarantee that a committed change to any source table reaches the media document, eventually and without relying on the code that made the change.
