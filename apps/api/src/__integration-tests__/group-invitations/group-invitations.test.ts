import { type GroupPermission, sql } from "@taiyomoe/db"
import { randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import type { Services } from "../../services"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { seedGroup, seedMembership } from "../helpers/seed"
import { test } from "../setup"

const usernameOf = async ({ db }: Services, userId: string) =>
  (
    await db
      .selectFrom("users")
      .select("username")
      .where("id", "=", userId)
      .executeTakeFirstOrThrow()
  ).username
const setup = async (services: Services) => {
  const owner = await signInAs(services)
  const invitee = await signInAs(services)
  const groupId = await seedGroup(services, owner.userId, `Group ${randomUUID()}`)

  await seedMembership(services, { groupId, userId: owner.userId, role: "OWNER" })

  return { owner, invitee, inviteeUsername: await usernameOf(services, invitee.userId), groupId }
}
const invite = (
  app: Parameters<typeof api>[0],
  groupId: string,
  headers: Record<string, string>,
  username: string,
  permissions: GroupPermission[] = [],
) =>
  api<{ id: string }>(app, `/groups/${groupId}/invitations`, {
    method: "POST",
    headers,
    json: { username, permissions },
  })
const idOf = (res: Awaited<ReturnType<typeof invite>>) => {
  if (!res.body.success) {
    throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
  }

  return res.body.data.id
}
const getMembership = ({ db }: Services, groupId: string, userId: string) =>
  db
    .selectFrom("groupMemberships")
    .select(["role", "permissions", "addedBy"])
    .where("groupId", "=", groupId)
    .where("userId", "=", userId)
    .executeTakeFirst()

describe("group invitations", () => {
  describe("POST /groups/:id/invitations", () => {
    test("an owner invites by username and the invitee gets an email", async ({
      app,
      services,
      mails,
    }) => {
      const { owner, invitee, inviteeUsername, groupId } = await setup(services)
      const res = await invite(app, groupId, owner.headers, inviteeUsername.toUpperCase(), [
        "EDIT_CHAPTERS",
        "UPLOAD_CHAPTERS",
      ])

      expect(res.status).toBe(201)

      const row = await services.db
        .selectFrom("groupInvitations")
        .select(["inviteeId", "inviterId", "permissions", "status"])
        .where("id", "=", idOf(res))
        .executeTakeFirstOrThrow()

      expect(row).toMatchObject({
        inviteeId: invitee.userId,
        inviterId: owner.userId,
        permissions: ["UPLOAD_CHAPTERS", "EDIT_CHAPTERS"],
        status: "PENDING",
      })
      expect(mails).toHaveLength(1)
      expect(mails[0]).toMatchObject({ expiresInDays: 7 })
    })

    test("invitations expire after seven days", async ({ app, services }) => {
      const { owner, inviteeUsername, groupId } = await setup(services)
      const id = idOf(await invite(app, groupId, owner.headers, inviteeUsername))
      const { days } = await services.db
        .selectFrom("groupInvitations")
        .select(sql<string>`extract(epoch from "expiresAt" - "createdAt") / 86400`.as("days"))
        .where("id", "=", id)
        .executeTakeFirstOrThrow()

      expect(Number(days)).toBe(7)
    })

    test("a manager can only grant permissions they hold", async ({ app, services }) => {
      const { invitee, inviteeUsername, groupId } = await setup(services)
      const manager = await signInAs(services)

      await seedMembership(services, {
        groupId,
        userId: manager.userId,
        permissions: ["MANAGE_MEMBERS", "UPLOAD_CHAPTERS"],
      })

      const escalate = await invite(app, groupId, manager.headers, inviteeUsername, [
        "DELETE_CHAPTERS",
      ])
      const delegate = await invite(app, groupId, manager.headers, inviteeUsername, [
        "MANAGE_MEMBERS",
      ])
      const grant = await invite(app, groupId, manager.headers, inviteeUsername, [
        "UPLOAD_CHAPTERS",
      ])

      expect(escalate.status).toBe(403)
      expect(delegate.status).toBe(403)
      expect(grant.status).toBe(201)
      expect(await getMembership(services, groupId, invitee.userId)).toBeUndefined()
    })

    test("members without MANAGE_MEMBERS, staff and outsiders cannot invite", async ({
      app,
      services,
    }) => {
      const { inviteeUsername, groupId } = await setup(services)
      const member = await signInAs(services)

      await seedMembership(services, {
        groupId,
        userId: member.userId,
        permissions: ["UPLOAD_CHAPTERS", "EDIT_CHAPTERS", "DELETE_CHAPTERS", "EDIT_GROUP"],
      })

      const others = [member.headers]

      for (const role of ["USER", "UPLOADER_INTERN", "UPLOADER", "MODERATOR"] as const) {
        others.push((await signInAs(services, { role })).headers)
      }

      for (const headers of others) {
        expect((await invite(app, groupId, headers, inviteeUsername)).status).toBe(403)
      }
    })

    test("outsiders are refused before the username is looked up", async ({ app, services }) => {
      const { groupId } = await setup(services)
      const { headers } = await signInAs(services)
      const res = await invite(app, groupId, headers, "nobody_has_this_name")

      expect(res.status).toBe(403)
    })

    test("an admin can invite to any group", async ({ app, services }) => {
      const { inviteeUsername, groupId } = await setup(services)
      const { headers } = await signInAs(services, { role: "ADMIN" })

      expect(
        (await invite(app, groupId, headers, inviteeUsername, ["MANAGE_MEMBERS"])).status,
      ).toBe(201)
    })

    test("unknown and banned usernames are not found", async ({ app, services }) => {
      const { owner, groupId } = await setup(services)
      const banned = await signInAs(services, { banned: true })

      for (const username of ["nobody_has_this_name", await usernameOf(services, banned.userId)]) {
        const res = await invite(app, groupId, owner.headers, username)

        expect(res.status).toBe(404)
        expect(res.body).toMatchObject({ code: "USER_NOT_FOUND" })
      }
    })

    test("members and users with a pending invitation cannot be invited again", async ({
      app,
      services,
    }) => {
      const { owner, inviteeUsername, groupId } = await setup(services)

      expect((await invite(app, groupId, owner.headers, inviteeUsername)).status).toBe(201)

      const again = await invite(app, groupId, owner.headers, inviteeUsername)
      const self = await invite(
        app,
        groupId,
        owner.headers,
        await usernameOf(services, owner.userId),
      )

      expect(again.body).toMatchObject({ code: "GROUP_INVITATION_EXISTS" })
      expect(self.body).toMatchObject({ code: "GROUP_MEMBER_EXISTS" })
    })

    test("an expired invitation does not block a new one", async ({ app, services }) => {
      const { owner, inviteeUsername, groupId } = await setup(services)
      const first = idOf(await invite(app, groupId, owner.headers, inviteeUsername))

      await services.db
        .updateTable("groupInvitations")
        .set({ expiresAt: new Date("2000-01-01T00:00:00Z") })
        .where("id", "=", first)
        .execute()

      expect((await invite(app, groupId, owner.headers, inviteeUsername)).status).toBe(201)

      const old = await services.db
        .selectFrom("groupInvitations")
        .select("status")
        .where("id", "=", first)
        .executeTakeFirstOrThrow()

      expect(old.status).toBe("EXPIRED")
    })

    test("no email is sent to an unverified address", async ({ app, services, mails }) => {
      const { owner, invitee, inviteeUsername, groupId } = await setup(services)

      await services.db
        .updateTable("users")
        .set({ emailVerified: false })
        .where("id", "=", invitee.userId)
        .execute()

      expect((await invite(app, groupId, owner.headers, inviteeUsername)).status).toBe(201)
      expect(mails).toEqual([])
    })
  })

  describe("answering", () => {
    test("accepting joins the group with the invited permissions", async ({ app, services }) => {
      const { owner, invitee, inviteeUsername, groupId } = await setup(services)
      const id = idOf(await invite(app, groupId, owner.headers, inviteeUsername, ["EDIT_CHAPTERS"]))
      const res = await api(app, `/group-invitations/${id}/accept`, {
        method: "POST",
        headers: invitee.headers,
      })

      expect(res.status).toBe(201)
      expect(await getMembership(services, groupId, invitee.userId)).toEqual({
        role: "MEMBER",
        permissions: ["EDIT_CHAPTERS"],
        addedBy: owner.userId,
      })
    })

    test("only the invitee can accept or decline", async ({ app, services }) => {
      const { owner, inviteeUsername, groupId } = await setup(services)
      const id = idOf(await invite(app, groupId, owner.headers, inviteeUsername))
      const stranger = await signInAs(services)

      for (const headers of [stranger.headers, owner.headers]) {
        for (const action of ["accept", "decline"]) {
          const res = await api(app, `/group-invitations/${id}/${action}`, {
            method: "POST",
            headers,
          })

          expect(res.status).toBe(404)
        }
      }
    })

    test("an expired invitation cannot be accepted", async ({ app, services }) => {
      const { owner, invitee, inviteeUsername, groupId } = await setup(services)
      const id = idOf(await invite(app, groupId, owner.headers, inviteeUsername))

      await services.db
        .updateTable("groupInvitations")
        .set({ expiresAt: new Date("2000-01-01T00:00:00Z") })
        .where("id", "=", id)
        .execute()

      const res = await api(app, `/group-invitations/${id}/accept`, {
        method: "POST",
        headers: invitee.headers,
      })

      expect(res.body).toMatchObject({ code: "GROUP_INVITATION_EXPIRED" })
      expect(await getMembership(services, groupId, invitee.userId)).toBeUndefined()
    })

    test("an invitation is void once the inviter can no longer grant it", async ({
      app,
      services,
    }) => {
      const { owner, invitee, inviteeUsername, groupId } = await setup(services)
      const manager = await signInAs(services)

      await seedMembership(services, {
        groupId,
        userId: manager.userId,
        permissions: ["MANAGE_MEMBERS", "DELETE_CHAPTERS"],
      })

      const id = idOf(
        await invite(app, groupId, manager.headers, inviteeUsername, ["DELETE_CHAPTERS"]),
      )

      await api(app, `/groups/${groupId}/members/${manager.userId}`, {
        method: "PATCH",
        headers: owner.headers,
        json: { permissions: ["MANAGE_MEMBERS"] },
      })

      const res = await api(app, `/group-invitations/${id}/accept`, {
        method: "POST",
        headers: invitee.headers,
      })

      expect(res.body).toMatchObject({ code: "GROUP_INVITATION_INVALID" })
      expect(await getMembership(services, groupId, invitee.userId)).toBeUndefined()
    })

    test("an invitation from a removed manager is void", async ({ app, services }) => {
      const { owner, invitee, inviteeUsername, groupId } = await setup(services)
      const manager = await signInAs(services)

      await seedMembership(services, {
        groupId,
        userId: manager.userId,
        permissions: ["MANAGE_MEMBERS"],
      })

      const id = idOf(await invite(app, groupId, manager.headers, inviteeUsername))

      await api(app, `/groups/${groupId}/members/${manager.userId}`, {
        method: "DELETE",
        headers: owner.headers,
      })

      const res = await api(app, `/group-invitations/${id}/accept`, {
        method: "POST",
        headers: invitee.headers,
      })

      expect(res.body).toMatchObject({ code: "GROUP_INVITATION_INVALID" })
    })

    test("declining closes the invitation", async ({ app, services }) => {
      const { owner, invitee, inviteeUsername, groupId } = await setup(services)
      const id = idOf(await invite(app, groupId, owner.headers, inviteeUsername))
      const decline = await api(app, `/group-invitations/${id}/decline`, {
        method: "POST",
        headers: invitee.headers,
      })
      const accept = await api(app, `/group-invitations/${id}/accept`, {
        method: "POST",
        headers: invitee.headers,
      })

      expect(decline.status).toBe(201)
      expect(accept.body).toMatchObject({ code: "GROUP_INVITATION_NOT_PENDING" })
    })

    test("accepting twice at the same time joins once", async ({ app, services }) => {
      const { owner, invitee, inviteeUsername, groupId } = await setup(services)
      const id = idOf(await invite(app, groupId, owner.headers, inviteeUsername))
      const accept = api(app, `/group-invitations/${id}/accept`, {
        method: "POST",
        headers: invitee.headers,
      })
      const acceptAgain = api(app, `/group-invitations/${id}/accept`, {
        method: "POST",
        headers: invitee.headers,
      })
      const statuses = [(await accept).status, (await acceptAgain).status]

      expect(new Set(statuses)).toEqual(new Set([201, 409]))
    })
  })

  describe("cancelling", () => {
    test("the inviter and the owner can cancel, others cannot", async ({ app, services }) => {
      const { owner, inviteeUsername, groupId } = await setup(services)
      const manager = await signInAs(services)
      const member = await signInAs(services)

      await seedMembership(services, {
        groupId,
        userId: manager.userId,
        permissions: ["MANAGE_MEMBERS"],
      })
      await seedMembership(services, { groupId, userId: member.userId })

      const id = idOf(
        await invite(app, groupId, owner.headers, inviteeUsername, ["DELETE_CHAPTERS"]),
      )
      const cancel = (headers: Record<string, string>) =>
        api(app, `/groups/${groupId}/invitations/${id}`, { method: "DELETE", headers })

      expect((await cancel(member.headers)).status).toBe(403)
      expect((await cancel(manager.headers)).status).toBe(403)
      expect((await cancel(owner.headers)).status).toBe(200)
      expect((await cancel(owner.headers)).body).toMatchObject({
        code: "GROUP_INVITATION_NOT_PENDING",
      })
    })

    test("an invitation of another group is not found", async ({ app, services }) => {
      const first = await setup(services)
      const second = await setup(services)
      const id = idOf(await invite(app, first.groupId, first.owner.headers, first.inviteeUsername))
      const res = await api(app, `/groups/${second.groupId}/invitations/${id}`, {
        method: "DELETE",
        headers: second.owner.headers,
      })

      expect(res.status).toBe(404)
    })
  })

  describe("listing", () => {
    test("the invitee sees their pending invitations, not expired or answered ones", async ({
      app,
      services,
    }) => {
      const { owner, invitee, inviteeUsername, groupId } = await setup(services)
      const other = await setup(services)
      const expired = await setup(services)
      const pending = idOf(await invite(app, groupId, owner.headers, inviteeUsername))
      const declined = idOf(await invite(app, other.groupId, other.owner.headers, inviteeUsername))
      const stale = idOf(await invite(app, expired.groupId, expired.owner.headers, inviteeUsername))

      await api(app, `/group-invitations/${declined}/decline`, {
        method: "POST",
        headers: invitee.headers,
      })
      await services.db
        .updateTable("groupInvitations")
        .set({ expiresAt: new Date("2000-01-01T00:00:00Z") })
        .where("id", "=", stale)
        .execute()

      const res = await api<Array<{ id: string; group: { id: string } }>>(
        app,
        "/users/me/group-invitations",
        { headers: invitee.headers },
      )

      if (!res.body.success) {
        throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
      }

      expect(res.body.data).toEqual([expect.objectContaining({ id: pending })])
      expect(res.body.data[0]?.group.id).toBe(groupId)
    })

    test("only people who can manage members see a group's invitations", async ({
      app,
      services,
    }) => {
      const { owner, inviteeUsername, groupId } = await setup(services)
      const member = await signInAs(services)

      await seedMembership(services, { groupId, userId: member.userId })
      await invite(app, groupId, owner.headers, inviteeUsername)

      const visible = await api<unknown[]>(app, `/groups/${groupId}/invitations`, {
        headers: owner.headers,
      })
      const hidden = await api(app, `/groups/${groupId}/invitations`, { headers: member.headers })

      expect(visible.body).toMatchObject({ success: true, data: [{ permissions: [] }] })
      expect(hidden.status).toBe(403)
    })
  })
})
