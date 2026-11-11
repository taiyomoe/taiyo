import { describe, expect } from "vitest"
import { findAuditLogs } from "../helpers/audit"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { seedGroup } from "../helpers/seed"
import { test } from "../setup"

type FollowState = { following: boolean; followerCount: number }

describe("/groups/:id/follow", () => {
  test("follows and unfollows a group, idempotently", async ({ app, services }) => {
    const { userId, headers } = await signInAs(services)
    const groupId = await seedGroup(services, userId, `follow-${userId}`)
    const first = await api<FollowState>(app, `/groups/${groupId}/follow`, {
      method: "POST",
      headers,
    })
    const again = await api<FollowState>(app, `/groups/${groupId}/follow`, {
      method: "POST",
      headers,
    })

    expect(first.body).toMatchObject({ data: { following: true, followerCount: 1 } })
    expect(again.body).toMatchObject({ data: { following: true, followerCount: 1 } })

    const state = await api<FollowState>(app, `/groups/${groupId}/follow`, { headers })

    expect(state.body).toMatchObject({ data: { following: true, followerCount: 1 } })

    const group = await api<{ followerCount: number }>(app, `/groups/${groupId}`)

    expect(group.body).toMatchObject({ data: { followerCount: 1 } })

    const removed = await api<FollowState>(app, `/groups/${groupId}/follow`, {
      method: "DELETE",
      headers,
    })

    expect(removed.body).toMatchObject({ data: { following: false, followerCount: 0 } })

    const follows = await findAuditLogs(services, "group.FOLLOW")
    const unfollows = await findAuditLogs(services, "group.UNFOLLOW")

    expect(follows.filter((log) => log.targetId === groupId)).toHaveLength(2)
    expect(unfollows.find((log) => log.targetId === groupId)).toMatchObject({
      outcome: "success",
      actorId: userId,
      targetType: "group",
    })
  })

  test("requires a session", async ({ app, services }) => {
    const { userId } = await signInAs(services)
    const groupId = await seedGroup(services, userId, `follow-anon-${userId}`)
    const res = await api(app, `/groups/${groupId}/follow`, { method: "POST" })

    expect(res.status).toBe(401)
  })
})
