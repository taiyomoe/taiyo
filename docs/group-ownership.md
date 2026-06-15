# Group ownership — design proposal

This document proposes a model for letting end-users claim ownership of groups
that were created in bulk by the team, gain editing rights on the group itself
and on every chapter linked to it, and recruit additional members over time.

It is a design only — no migration or code is included in the commit that ships
this file. The proposal is structured so it can be rolled out in three phases
without breaking existing routes.

## Goals

1. Groups start "unowned" — created in bulk by uploaders / mods.
2. A user can submit a request to take ownership of an unowned group.
3. Once approved, the user becomes the group's owner and can:
   - Rename, change description, edit any field on the group.
   - Edit any chapter linked to the group (number, language, content rating,
     flag, title; later, page uploads).
   - Invite other users as members, promote members to co-owners, transfer
     ownership, leave the group.
4. Uploaders / uploader-interns lose edit access to a group once it is owned,
   unless they are members of it. Mods/admins always retain access.

## Data model

Two new tables.

### `groupMemberships`

A many-to-many between users and groups, carrying a role.

| Column      | Type                                                 | Notes                                                     |
| ----------- | ---------------------------------------------------- | --------------------------------------------------------- |
| `userId`    | `uuid` references `users(id)` `ON DELETE CASCADE`    | composite primary key                                     |
| `groupId`   | `uuid` references `groups(id)` `ON DELETE CASCADE`   | composite primary key                                     |
| `role`      | `text` check (`'OWNER'` | `'MEMBER'`)                 | application-enforced: at least one OWNER per owned group |
| `addedBy`   | `uuid` references `users(id)`                        | who created the membership (audit)                        |
| `createdAt` | `timestamp(3)` default `current_timestamp`           |                                                           |

Indexes:

- `(groupId, role)` for cheap "is this group owned?" lookups.
- `(userId)` for cheap "what groups does this user belong to?" lookups (used by
  the chapter-access middleware on every chapter mutation).

A group is **unowned** when there is no row with `(groupId = X, role = 'OWNER')`.
A group is **owned** when at least one such row exists.

### `groupOwnershipRequests`

Audit + workflow trail for claim requests.

| Column         | Type                                                | Notes                                                                     |
| -------------- | --------------------------------------------------- | ------------------------------------------------------------------------- |
| `id`           | `uuid` primary key                                  |                                                                           |
| `userId`       | `uuid` references `users(id)`                       | the requester                                                             |
| `groupId`      | `uuid` references `groups(id)`                      |                                                                           |
| `status`       | enum (`PENDING` / `APPROVED` / `REJECTED` / `CANCELLED`) | default `PENDING`                                                         |
| `message`      | `text` nullable                                     | requester's pitch                                                         |
| `reviewerId`   | `uuid` references `users(id)` nullable              | mod/admin who acted on it                                                 |
| `reviewerNote` | `text` nullable                                     | required when status = `REJECTED`                                         |
| `createdAt`    | `timestamp(3)` default `current_timestamp`          |                                                                           |
| `updatedAt`    | `timestamp(3)` default `current_timestamp`          |                                                                           |

Partial unique index so a single user can have at most one pending request per
group at a time:

```sql
CREATE UNIQUE INDEX groupOwnershipRequests_pending_unique
  ON groupOwnershipRequests (userId, groupId)
  WHERE status = 'PENDING';
```

Rejected / cancelled rows stay around so we have an audit trail and so the same
user can re-request later if needed.

## Permission model

Two derived predicates power everything.

### `canEditGroup(user, group, memberships)`

`memberships` = the user's set of `groupMemberships` rows.

- `true` if `user.role` ∈ `{ADMIN, MODERATOR}`.
- Otherwise let `owned = group has at least one OWNER membership`.
  - If **unowned**: `true` if `user.role` ∈ `{UPLOADER, UPLOADER_INTERN}`.
  - If **owned**: `true` if `(user.id, group.id)` is in `memberships`
    (regardless of OWNER vs MEMBER).
- Otherwise `false`.

In plain English: uploaders can edit unowned groups freely; once a group is
owned, only its members and mods/admins can touch it.

### `canEditChapter(user, chapter, linkedGroups, memberships)`

`linkedGroups` = `chapterGroups` rows for the chapter, joined to the group's
ownership state (so we know which are "owned").

- `true` if `user.role` ∈ `{ADMIN, MODERATOR}`.
- Let `ownedLinkedGroups = linkedGroups.filter(g => g.owned)`.
- If `ownedLinkedGroups.length === 0` (the chapter has no owned groups linked —
  including the case where the chapter has no group links at all):
  - `true` if `user.role` ∈ `{UPLOADER, UPLOADER_INTERN}`.
- Else (at least one linked group is owned):
  - `true` if the user is a member of any of `ownedLinkedGroups`.
  - `false` otherwise — even uploaders are locked out.

In plain English: a chapter belongs to its owners. If any of its linked groups
is owned, only those owners' people and mods/admins can edit it. If no linked
group is owned, the chapter is editable by uploaders like today.

### Edge cases

- **Multiple owned groups on one chapter** (union model): if the chapter is
  linked to GroupA (owned by Alice) and GroupB (owned by Bob), both Alice's
  members and Bob's members can edit. This is intentional — chapters often
  involve multiple groups collaborating.
- **Mixed owned / unowned**: if linked to GroupA (owned) and GroupB (unowned),
  the chapter is **claimed** (because GroupA is owned). Uploaders are locked
  out; only Alice's members and mods/admins can edit. GroupB membership alone
  is not enough because GroupB has no members.
- **Last-owner removal**: refuse to demote/remove the only OWNER. The owner
  must promote or invite someone else first, or transfer ownership in one shot.

## Routes

### Ownership requests

| Method | Path                                          | Auth                             | Notes                                                                |
| ------ | --------------------------------------------- | -------------------------------- | -------------------------------------------------------------------- |
| POST   | `/groups/:id/ownership-requests`              | any signed-in user, not banned   | body `{ message? }`. Fails if group is already owned or pending exists. |
| GET    | `/groups/:id/ownership-requests`              | mod/admin, or the requester      | list (filtered by status optional).                                 |
| GET    | `/users/me/ownership-requests`                | self                              | requester's own requests across groups.                              |
| DELETE | `/ownership-requests/:id`                     | the requester                    | cancel a pending request.                                            |
| POST   | `/ownership-requests/:id/approve`             | mod/admin                        | creates OWNER membership; auto-cancels other pending requests for the same group. |
| POST   | `/ownership-requests/:id/reject`              | mod/admin                        | body `{ note }`.                                                     |

### Memberships

| Method | Path                                              | Auth                                            | Notes                                                          |
| ------ | ------------------------------------------------- | ----------------------------------------------- | -------------------------------------------------------------- |
| GET    | `/groups/:id/members`                             | public                                          | list owners + members.                                        |
| POST   | `/groups/:id/members`                             | any OWNER of the group, mod/admin              | body `{ userId, role }`.                                       |
| DELETE | `/groups/:id/members/:userId`                     | any OWNER, mod/admin                            | refuses last-owner case.                                       |
| POST   | `/groups/:id/members/:userId/promote`             | any OWNER, mod/admin                            | MEMBER → OWNER.                                                |
| POST   | `/groups/:id/members/:userId/demote`              | any OWNER, mod/admin                            | OWNER → MEMBER. Refuses last-owner.                            |
| POST   | `/groups/:id/leave`                               | self                                            | refuses last-owner case (must promote / transfer first).      |
| POST   | `/groups/:id/transfer`                            | any OWNER                                       | body `{ toUserId }`. Atomic promote-target + demote-self.     |

### Existing routes that gain ownership awareness

These currently use `withAuth("update" | "delete", "Group")` or
`withAuth("update" | "delete", "Chapter")`. They'd switch to a new
ownership-aware middleware:

- `PATCH /groups/:id`, `DELETE /groups/:id` → `requireGroupAccess`
- `PATCH /chapters/:id`, `DELETE /chapters/:id` → `requireChapterAccess`
- `POST/DELETE /chapters/:id/groups/...` (linking) → `requireChapterAccess`
- Later: `POST /chapters/:id/pages` (when page upload lands) → `requireChapterAccess`

The new middlewares run **after** `withAuth("...", "Chapter")` /
`withAuth("...", "Group")`. The base `withAuth` still gates on
authenticated-and-not-banned; the new middleware refines "can this specific
user edit this specific resource."

Implementation sketch:

```ts
export const requireChapterAccess = createMiddleware(async (c, next) => {
  const { db, user, chapter } = c.var
  if (user.role === "ADMIN" || user.role === "MODERATOR") return next()

  // linked groups + ownership
  const linkedOwned = await db
    .selectFrom("chapterGroups")
    .innerJoin("groupMemberships", "groupMemberships.groupId", "chapterGroups.groupId")
    .where("chapterGroups.chapterId", "=", chapter.id)
    .where("groupMemberships.role", "=", "OWNER")
    .select("groupMemberships.groupId")
    .execute()

  if (linkedOwned.length === 0) {
    // unclaimed — fall back to base RBAC
    if (user.role === "UPLOADER" || user.role === "UPLOADER_INTERN") return next()
    return c.fail("FORBIDDEN")
  }

  const ownedGroupIds = new Set(linkedOwned.map((r) => r.groupId))
  const myGroups = await db
    .selectFrom("groupMemberships")
    .select("groupId")
    .where("userId", "=", user.id)
    .execute()

  if (myGroups.some((m) => ownedGroupIds.has(m.groupId))) return next()
  return c.fail("FORBIDDEN")
})
```

The query stays cheap because both tables are indexed on the keys we filter on.

## Error codes to add

| Code                              | Status | Used when                                                            |
| --------------------------------- | ------ | -------------------------------------------------------------------- |
| `GROUP_ALREADY_OWNED`             | 409    | trying to claim a group that already has an owner                    |
| `OWNERSHIP_REQUEST_EXISTS`        | 409    | user already has a pending request for the same group                |
| `OWNERSHIP_REQUEST_NOT_FOUND`     | 404    | targeting an unknown request id                                      |
| `OWNERSHIP_REQUEST_NOT_PENDING`   | 409    | trying to approve / reject / cancel a non-pending request            |
| `GROUP_MEMBER_NOT_FOUND`          | 404    | targeting a (group, user) that has no membership                     |
| `GROUP_MEMBER_EXISTS`             | 409    | adding a (group, user) that's already a member                       |
| `GROUP_LAST_OWNER`                | 409    | demote / leave / remove would leave the group ownerless              |

## Phasing

The proposal is intentionally splittable so it can ship without a Big Bang.

**Phase 1 — schema only.** Migration adds `groupMemberships` and
`groupOwnershipRequests` plus the partial unique index. No route changes. The
new tables are empty so nothing changes in behavior. Tests just cover the
migration shape.

**Phase 2 — workflow routes.** Add all routes under
`/groups/:id/ownership-requests`, `/ownership-requests/:id/(approve|reject)`,
`/groups/:id/members*`, etc. Existing routes still use the plain `withAuth`
gates. Approving a request creates an OWNER membership but no other route
*reads* it yet. Tests cover the workflow in isolation.

**Phase 3 — enforce ownership.** Replace `withAuth(...)` with the new
`requireGroupAccess` / `requireChapterAccess` middlewares on the routes that
should be ownership-aware. This is the only phase that changes the meaning of
existing routes. Once shipped, the ownership rules described above are live.

Each phase is self-contained and committed independently.

## Open questions worth flagging

These were resolved in this document with reasonable defaults; flag if any of
them should be revisited:

- **Single vs. multiple owners**: chose multiple, modeled via the `OWNER` role
  in `groupMemberships`. Real scanlation groups have co-leads.
- **Auto-approval vs. mod review**: chose mod review. Auto-approval would let
  users squat groups. Mod review costs latency but is reversible.
- **Uploaders kept out of owned groups**: chose yes (Interpretation B in my
  notes). Maintains the "this group is mine" guarantee that makes ownership
  meaningful.
- **Union vs. intersection across multiple linked groups**: chose union.
  Reflects how collaborations actually work.
- **Multi-group chapter, one owned**: claimed. The owned group dominates.
- **Last-owner protection**: enforced in the app layer, not the DB. A `DEFER`-
  able trigger would be stronger but adds friction.
