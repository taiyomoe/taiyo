import { describe, expect } from "vitest"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { seedGroup, seedMembership } from "../helpers/seed"
import { test } from "../setup"

type Comment = { id: string; content: string; author: { id: string; groupRole: string | null } }

describe("/groups/:id/comments", () => {
  test("posts, lists newest first and deletes comments", async ({ app, services }) => {
    const owner = await signInAs(services)
    const reader = await signInAs(services)
    const stranger = await signInAs(services)
    const moderator = await signInAs(services, { role: "MODERATOR" })
    const groupId = await seedGroup(services, owner.userId, `comments-${owner.userId}`)

    await seedMembership(services, { groupId, userId: owner.userId, role: "OWNER" })

    const first = await api<Comment>(app, `/groups/${groupId}/comments`, {
      method: "POST",
      headers: reader.headers,
      json: { content: "Thanks for the chapters!" },
    })
    const second = await api<Comment>(app, `/groups/${groupId}/comments`, {
      method: "POST",
      headers: owner.headers,
      json: { content: "Thank you for reading." },
    })

    if (!first.body.success || !second.body.success) {
      throw new Error("Expected success")
    }

    expect(second.body.data.author.groupRole).toBe("OWNER")
    expect(first.body.data.author.groupRole).toBeNull()

    const list = await api<Comment[]>(app, `/groups/${groupId}/comments`)

    if (!list.body.success) {
      throw new Error("Expected success")
    }

    expect(list.body.data.map((comment) => comment.id)).toEqual([
      second.body.data.id,
      first.body.data.id,
    ])
    expect(list.body.meta).toMatchObject({ total: 2 })

    const forbidden = await api(app, `/groups/${groupId}/comments/${first.body.data.id}`, {
      method: "DELETE",
      headers: stranger.headers,
    })

    expect(forbidden.status).toBe(403)

    const own = await api(app, `/groups/${groupId}/comments/${first.body.data.id}`, {
      method: "DELETE",
      headers: reader.headers,
    })
    const moderated = await api(app, `/groups/${groupId}/comments/${second.body.data.id}`, {
      method: "DELETE",
      headers: moderator.headers,
    })

    expect(own.status).toBe(200)
    expect(moderated.status).toBe(200)

    const empty = await api<Comment[]>(app, `/groups/${groupId}/comments`)

    expect(empty.body).toMatchObject({ data: [], meta: { total: 0 } })
  })

  test("rejects an empty comment", async ({ app, services }) => {
    const { userId, headers } = await signInAs(services)
    const groupId = await seedGroup(services, userId, `comments-empty-${userId}`)
    const res = await api(app, `/groups/${groupId}/comments`, {
      method: "POST",
      headers,
      json: { content: "   " },
    })

    expect(res.status).toBe(422)
  })
})
