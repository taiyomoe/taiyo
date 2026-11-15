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
3. Once an admin approves, the user becomes the group's owner and can:
   - Edit any field on the group.
   - Upload chapters to any media, credited to the group, and edit or delete
     every chapter credited to the group, whoever uploaded it.
   - Give members a set of group permissions, promote members to co-owners,
     transfer ownership, leave the group.
4. Uploaders, moderators and admins keep their site-wide access to groups and
   chapters. Ownership is **additive**; it never takes access away from a role.

## Data model

Two new tables.

### `groupMemberships`

A many-to-many between users and groups, carrying a role.

| Column | Type | Notes |
| ----------- | -------------------------------------------------- | ---------------------------------- | -------------------------------------------------------- |
| `userId` | `uuid` references `users(id)` `ON DELETE CASCADE` | composite primary key |
| `groupId` | `uuid` references `groups(id)` `ON DELETE CASCADE` | composite primary key |
| `role` | `text` check (`'OWNER'` | `'MEMBER'`) | application-enforced: at least one OWNER per owned group |
| `permissions` | `text[]` checked against the group permissions | ignored while the role is `OWNER` |
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
| `reviewerId`   | `uuid` references `users(id)` nullable                   | admin who acted on it             |
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

Every permission lives in `packages/permissions` (Permix). The API and the web
app build the same rules from the user's role and their memberships in
non-deleted groups. Banned users get nothing.

### Group permissions

Members hold a subset of `UPLOAD_CHAPTERS`, `EDIT_CHAPTERS`, `DELETE_CHAPTERS`,
`EDIT_GROUP` and `MANAGE_MEMBERS`. Owners hold all of them.

- **Chapters.** A permission in any group credited on a chapter applies to the
  whole chapter, so one group of a joint release can edit or delete it alone.
  Removing a credit needs `EDIT_CHAPTERS` in the group being removed.
- **Uploading.** A member publishes directly when the chapter credits at least
  one group where they hold `UPLOAD_CHAPTERS`. Other groups may be credited
  alongside it. Uploaders and admins publish with any groups or none.
- **Managing members.** Owners can change any member's permissions, remove
  members and promote them. A member with `MANAGE_MEMBERS` can only grant or
  revoke permissions they hold, never `MANAGE_MEMBERS` itself, and cannot touch
  themselves, other managers, or members holding permissions they lack. Owners
  cannot remove or demote each other; an owner can only step down. Admins can
  do anything, including removing the last owner, which makes the group
  claimable again.
- **Groups.** Owners and members with `EDIT_GROUP` edit the group. Uploaders,
  moderators and admins edit any group. Only uploaders and admins create groups,
  and only admins delete them.

## Routes

### Ownership requests

| Method | Path                              | Auth                           | Notes                                                                              |
| ------ | --------------------------------- | ------------------------------ | ---------------------------------------------------------------------------------- |
| POST   | `/groups/:id/ownership-requests`  | any signed-in user, not banned | body `{ message, proofLinks }`. Fails if group is already owned or pending exists. |
| GET    | `/groups/:id/ownership-requests`  | admin, or the requester        | list (filtered by status optional).                                                |
| GET    | `/users/me/ownership-requests`    | self                           | requester's own requests across groups.                                            |
| DELETE | `/ownership-requests/:id`         | the requester                  | cancel a pending request.                                                          |
| POST   | `/ownership-requests/:id/approve` | admin                          | creates OWNER membership; auto-cancels other pending requests for the same group.  |
| POST   | `/ownership-requests/:id/reject`  | admin                          | body `{ note }`, required.                                                         |
| GET    | `/ownership-requests`             | admin                          | the review queue across groups.                                                    |

### Memberships

| Method | Path                                  | Auth                           | Notes                                                       |
| ------ | ------------------------------------- | ------------------------------ | ----------------------------------------------------------- |
| GET    | `/groups/:id/members`                 | public                         | list owners + members.                                      |
| PATCH  | `/groups/:id/members/:userId`         | owner, `MANAGE_MEMBERS`, admin | body `{ permissions }`. Replaces the member's permissions.  |
| DELETE | `/groups/:id/members/:userId`         | owner, `MANAGE_MEMBERS`, admin | refuses last-owner case unless an admin does it.            |
| POST   | `/groups/:id/members/:userId/promote` | owner, admin                   | MEMBER → OWNER.                                             |
| POST   | `/groups/:id/members/:userId/demote`  | the owner themselves, admin    | OWNER → MEMBER. Refuses last-owner unless an admin does it. |
| POST   | `/groups/:id/leave`                   | self                           | refuses last-owner case (must promote / transfer first).    |
| POST   | `/groups/:id/transfer`                | owner                          | body `{ toUserId }`. Atomic promote-target + demote-self.   |

### Invitations

Owners and members with `MANAGE_MEMBERS` invite people by username with a set of
permissions; the same anti-escalation rules as editing a member apply. The
invitee accepts or declines from their dashboard and gets an email if they have
a verified address. Invitations expire after 7 days. Accepting re-checks, under
the group lock, that the inviter can still grant the invited permissions, so an
invitation sent by a manager who lost the right is void.

| Method | Path                                         | Auth                                   | Notes                             |
| ------ | -------------------------------------------- | -------------------------------------- | --------------------------------- |
| POST   | `/groups/:id/invitations`                    | owner, `MANAGE_MEMBERS`, admin         | body `{ username, permissions }`. |
| GET    | `/groups/:id/invitations`                    | owner, `MANAGE_MEMBERS`, admin         | pending, unexpired invitations.   |
| DELETE | `/groups/:id/invitations/:invitationId`      | the inviter, or anyone able to send it | cancels a pending invitation.     |
| GET    | `/users/me/group-invitations`                | self                                   | pending, unexpired invitations.   |
| POST   | `/group-invitations/:id/accept` / `/decline` | the invitee                            |                                   |

### Group creation requests

A user whose group is not on Taiyō yet asks for it with a name, a message and
proof links. Names of existing groups are refused, since those should be
claimed instead. An admin approves, which creates the group with the requester
as its owner, or rejects with a note. A user can have three pending requests.

### Where the ownership rules are enforced

Every membership change (add, promote, demote, remove, leave, transfer, and the
claim behind approving a request) goes through `apps/api/src/group-membership.ts`.
Each operation locks the group's row (`SELECT … FOR UPDATE` on `groups`) before
reading roles, so two concurrent changes on one group run one after the other
and the second sees the first's result. That is what keeps "at least one OWNER"
true when two owners leave or step down at the same moment.

The permission check for a membership change also runs inside the lock,
against the caller's and the target's memberships as they are at that point.
A manager whose `MANAGE_MEMBERS` was revoked a moment earlier is refused even if
their request started before the revocation.

The rule covers membership operations only. Deleting a user cascades their
memberships without the lock, so deleting the only owner's account turns the
group back into an unowned group that can be claimed again.

### Which 409 a losing concurrent approval gets

Two admins approving two different pending requests on the same unowned
group both return 409 for the loser, but the code depends on the interleaving,
and both are correct:

- `GROUP_ALREADY_OWNED` — the loser read its request while it was still
  `PENDING`, passed the status guard, then blocked on the group's row lock in
  `claimGroup` and found an OWNER once the winner committed.
- `OWNERSHIP_REQUEST_NOT_PENDING` — the winner committed first, including the
  auto-cancel of every other pending request on the group, so the loser's own
  request was already `CANCELLED` when `checkOwnershipRequest` loaded it.

`checkOwnershipRequest` resolves the row before `withTransaction` opens the
transaction and before the group lock is taken, so which guard trips first is
a matter of timing. The invariant that matters — one 201, one 409, exactly one
OWNER row — holds either way, which is what the integration test asserts.
Tightening this to a single deterministic code would mean re-reading the
request's status inside the transaction after the lock, which would make
`OWNERSHIP_REQUEST_NOT_PENDING` the only possible answer here.

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

**Phase 3 — enforce ownership.** Route checks move to the shared rules in
`packages/permissions`, and memberships gain per-member permissions. This is
the only phase that changes the meaning of existing routes. Once shipped, the
ownership rules described above are live.

Each phase is self-contained and committed independently.

## Open questions worth flagging

These were resolved in this document with reasonable defaults; flag if any of
them should be revisited:

- **Single vs. multiple owners**: chose multiple, modeled via the `OWNER` role
  in `groupMemberships`. Real scanlation groups have co-leads.
- **Auto-approval vs. review**: chose admin review. Auto-approval would let
  users squat groups. Review costs latency but is reversible.
- **Uploaders kept out of owned groups**: chose no (additive model — uploaders
  always retain access). Ownership only grants extra capability to `USER`s;
  the uploader/mod/admin role table is unchanged.
- **Union vs. intersection across multiple linked groups**: chose union.
  Reflects how collaborations actually work.
- **Last-owner protection**: enforced in the app layer, not the DB. A `DEFER`-
  able trigger would be stronger but adds friction.
