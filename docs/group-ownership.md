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
4. Uploaders / uploader-interns and mods / admins always retain edit access to
   every group and chapter — ownership is **additive** for regular `USER`s,
   not a transfer of power away from the uploader role.

## Data model

Two new tables.

### `groupMemberships`

A many-to-many between users and groups, carrying a role.

| Column | Type | Notes |
| ----------- | -------------------------------------------------- | ---------------------------------- | -------------------------------------------------------- |
| `userId` | `uuid` references `users(id)` `ON DELETE CASCADE` | composite primary key |
| `groupId` | `uuid` references `groups(id)` `ON DELETE CASCADE` | composite primary key |
| `role` | `text` check (`'OWNER'` | `'MEMBER'`) | application-enforced: at least one OWNER per owned group |
| `addedBy` | `uuid` references `users(id)` | who created the membership (audit) |
| `createdAt` | `timestamp(3)` default `current_timestamp` | |

Indexes:

- `(groupId, role)` for cheap "is this group owned?" lookups.
- `(userId)` for cheap "what groups does this user belong to?" lookups (used by
  the chapter-access middleware on every chapter mutation).

A group is **unowned** when there is no row with `(groupId = X, role = 'OWNER')`.
A group is **owned** when at least one such row exists.

### `groupOwnershipRequests`

Audit + workflow trail for claim requests.

| Column         | Type                                                     | Notes                             |
| -------------- | -------------------------------------------------------- | --------------------------------- |
| `id`           | `uuid` primary key                                       |                                   |
| `userId`       | `uuid` references `users(id)`                            | the requester                     |
| `groupId`      | `uuid` references `groups(id)`                           |                                   |
| `status`       | enum (`PENDING` / `APPROVED` / `REJECTED` / `CANCELLED`) | default `PENDING`                 |
| `message`      | `text` nullable                                          | requester's pitch                 |
| `reviewerId`   | `uuid` references `users(id)` nullable                   | mod/admin who acted on it         |
| `reviewerNote` | `text` nullable                                          | required when status = `REJECTED` |
| `createdAt`    | `timestamp(3)` default `current_timestamp`               |                                   |
| `updatedAt`    | `timestamp(3)` default `current_timestamp`               |                                   |

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

The model is **additive**: ownership only ever _grants_ extra access — it never
strips access from uploaders. Two predicates power everything.

### `canEditGroup(user, group, memberships)`

`memberships` = the user's set of `groupMemberships` rows.

- `true` if `user.role` ∈ `{ADMIN, MODERATOR, UPLOADER, UPLOADER_INTERN}`.
- `true` if `(user.id, group.id)` is in `memberships` (regardless of OWNER vs
  MEMBER).
- Otherwise `false`.

In plain English: uploaders / mods / admins can always edit any group;
ownership lets regular users (`USER` role) edit the specific groups they're
members of.

### `canEditChapter(user, chapter, linkedGroups, memberships)`

`linkedGroups` = `chapterGroups` rows for the chapter.

- `true` if `user.role` ∈ `{ADMIN, MODERATOR, UPLOADER, UPLOADER_INTERN}`.
- `true` if the user is a member of any group in `linkedGroups`.
- Otherwise `false`.

In plain English: uploaders / mods / admins can always edit any chapter;
ownership lets regular users edit the chapters of groups they belong to.

### Edge cases

- **Multiple groups on one chapter** (union model): membership in any one of
  the linked groups grants access. Reflects how collaborations actually work.
- **Last-owner removal**: refuse to demote/remove/leave the only OWNER. The
  owner must promote or invite someone else first, or transfer ownership in
  one shot.

## Routes

### Ownership requests

| Method | Path                              | Auth                           | Notes                                                                             |
| ------ | --------------------------------- | ------------------------------ | --------------------------------------------------------------------------------- |
| POST   | `/groups/:id/ownership-requests`  | any signed-in user, not banned | body `{ message? }`. Fails if group is already owned or pending exists.           |
| GET    | `/groups/:id/ownership-requests`  | mod/admin, or the requester    | list (filtered by status optional).                                               |
| GET    | `/users/me/ownership-requests`    | self                           | requester's own requests across groups.                                           |
| DELETE | `/ownership-requests/:id`         | the requester                  | cancel a pending request.                                                         |
| POST   | `/ownership-requests/:id/approve` | mod/admin                      | creates OWNER membership; auto-cancels other pending requests for the same group. |
| POST   | `/ownership-requests/:id/reject`  | mod/admin                      | body `{ note }`.                                                                  |

### Memberships

| Method | Path                                  | Auth                              | Notes                                                     |
| ------ | ------------------------------------- | --------------------------------- | --------------------------------------------------------- |
| GET    | `/groups/:id/members`                 | public                            | list owners + members.                                    |
| POST   | `/groups/:id/members`                 | any OWNER of the group, mod/admin | body `{ userId, role }`.                                  |
| DELETE | `/groups/:id/members/:userId`         | any OWNER, mod/admin              | refuses last-owner case.                                  |
| POST   | `/groups/:id/members/:userId/promote` | any OWNER, mod/admin              | MEMBER → OWNER.                                           |
| POST   | `/groups/:id/members/:userId/demote`  | any OWNER, mod/admin              | OWNER → MEMBER. Refuses last-owner.                       |
| POST   | `/groups/:id/leave`                   | self                              | refuses last-owner case (must promote / transfer first).  |
| POST   | `/groups/:id/transfer`                | any OWNER                         | body `{ toUserId }`. Atomic promote-target + demote-self. |

### Existing routes that gain ownership awareness

These currently use `withAuth("update" | "delete", "Group")` or
`withAuth("update" | "delete", "Chapter")`. They switch to a baseline signed-in
gate (`withAuth("read", "OwnershipRequest")`) plus a new ownership-aware
middleware:

- `PATCH /groups/:id`, `DELETE /groups/:id` → `requireGroupAccess`
- `PATCH /chapters/:id`, `DELETE /chapters/:id` → `requireChapterAccess`
- `POST/DELETE /chapters/:id/groups/...` (linking) → `requireChapterAccess`
- Later: `POST /chapters/:id/pages` (when page upload lands) → `requireChapterAccess`

The new middlewares run **after** the baseline `withAuth(...)` and the
`checkGroup()` / `checkChapter()` resolvers. The baseline `withAuth` gates on
authenticated-and-not-banned; the new middleware refines "can this specific
user edit this specific resource."

Implementation sketch:

```ts
export const requireChapterAccess = createMiddleware(async (c, next) => {
  const { db, user, chapter } = c.var

  if (
    user.role === "ADMIN" ||
    user.role === "MODERATOR" ||
    user.role === "UPLOADER" ||
    user.role === "UPLOADER_INTERN"
  ) {
    return next()
  }

  const membership = await db
    .selectFrom("chapterGroups")
    .innerJoin("groupMemberships", "groupMemberships.groupId", "chapterGroups.groupId")
    .select("groupMemberships.groupId")
    .where("chapterGroups.chapterId", "=", chapter.id)
    .where("groupMemberships.userId", "=", user.id)
    .limit(1)
    .executeTakeFirst()

  if (membership) return next()
  return c.fail("FORBIDDEN")
})
```

The query stays cheap because both tables are indexed on the keys we filter on.

## Error codes to add

| Code                            | Status | Used when                                                 |
| ------------------------------- | ------ | --------------------------------------------------------- |
| `GROUP_ALREADY_OWNED`           | 409    | trying to claim a group that already has an owner         |
| `OWNERSHIP_REQUEST_EXISTS`      | 409    | user already has a pending request for the same group     |
| `OWNERSHIP_REQUEST_NOT_FOUND`   | 404    | targeting an unknown request id                           |
| `OWNERSHIP_REQUEST_NOT_PENDING` | 409    | trying to approve / reject / cancel a non-pending request |
| `GROUP_MEMBER_NOT_FOUND`        | 404    | targeting a (group, user) that has no membership          |
| `GROUP_MEMBER_EXISTS`           | 409    | adding a (group, user) that's already a member            |
| `GROUP_LAST_OWNER`              | 409    | demote / leave / remove would leave the group ownerless   |

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
_reads_ it yet. Tests cover the workflow in isolation.

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
- **Uploaders kept out of owned groups**: chose no (additive model — uploaders
  always retain access). Ownership only grants extra capability to `USER`s;
  the uploader/mod/admin role table is unchanged.
- **Union vs. intersection across multiple linked groups**: chose union.
  Reflects how collaborations actually work.
- **Last-owner protection**: enforced in the app layer, not the DB. A `DEFER`-
  able trigger would be stronger but adds friction.
