# Taiyō domain glossary

## Search

**Media document**: the denormalised record of one media in the Meilisearch `medias` index, built by `getMediaDocument` from `medias`, `titles`, `covers`, `mediaStaffs` + `staffs`, `chapters` and `userLibraryEntries`. A media with no live main title or main cover has no media document.

**Search outbox**: the `searchOutbox` table of mediaIds whose media document may be stale. Postgres triggers on the six source tables write to it inside the same transaction as the change, so no write path can skip it. The only direct writer is the forced reindex route.

**Drain**: reading pending search outbox rows and rebuilding, or removing, each media document. The API drains right after a transaction commits; the worker drains on a schedule to retry anything a failed drain left behind. A row is only removed once its media document has been pushed.

**Search freshness**: the guarantee that a committed change to any source table reaches the media document, eventually and without relying on the code that made the change.

## Groups

**Owned group / unowned group**: a group is owned while at least one `groupMemberships` row for it has the OWNER role, and unowned otherwise. Groups created in bulk start unowned.

**Group membership**: a user's MEMBER or OWNER role in a group. Every change to it goes through the group membership module (`apps/api/src/group-membership.ts`), which locks the group so an owned group never loses its last owner through a membership operation. Deleting the only owner's account is the exception: the group becomes unowned.

**Claim**: making the first owner of an unowned group, which happens when a moderator approves an ownership request. It fails if the group became owned in the meantime.

**Transfer**: an owner making another existing member an owner and stepping down to MEMBER in one step.
