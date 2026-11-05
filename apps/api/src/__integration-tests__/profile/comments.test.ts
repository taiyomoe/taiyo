import { describe, expect } from "vitest"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { test } from "../setup"

const comment = async (
  app: Parameters<typeof api>[0],
  headers: Record<string, string>,
  profileId: string,
) => {
  const res = await api<{ id: string }>(app, `/users/${profileId}/comments`, {
    method: "POST",
    headers,
    json: { content: "nice profile" },
  })

  if (!res.body.success) {
    throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
  }

  return res.body.data.id
}

describe("profile comments", () => {
  test("lists comments newest first with who may delete them", async ({ app, services }) => {
    const owner = await signInAs(services)
    const author = await signInAs(services)
    const stranger = await signInAs(services)

    await comment(app, author.headers, owner.userId)
    await comment(app, stranger.headers, owner.userId)

    const res = await api<Array<{ author: { id: string }; canDelete: boolean }>>(
      app,
      `/users/${owner.userId}/comments`,
      { headers: author.headers },
    )

    if (!res.body.success) {
      throw new Error("Expected success")
    }

    expect(res.body.data.map((item) => [item.author.id, item.canDelete])).toEqual([
      [stranger.userId, false],
      [author.userId, true],
    ])
  })

  test("lets the profile owner delete any comment, but not a stranger", async ({
    app,
    services,
  }) => {
    const owner = await signInAs(services)
    const author = await signInAs(services)
    const stranger = await signInAs(services)
    const id = await comment(app, author.headers, owner.userId)
    const denied = await api(app, `/users/${owner.userId}/comments/${id}`, {
      method: "DELETE",
      headers: stranger.headers,
    })

    expect(denied.status).toBe(403)

    const removed = await api(app, `/users/${owner.userId}/comments/${id}`, {
      method: "DELETE",
      headers: owner.headers,
    })

    expect(removed.status).toBe(200)

    const again = await api(app, `/users/${owner.userId}/comments/${id}`, {
      method: "DELETE",
      headers: owner.headers,
    })

    expect(again.status).toBe(404)
  })

  test("lets moderators delete comments", async ({ app, services }) => {
    const owner = await signInAs(services)
    const author = await signInAs(services)
    const moderator = await signInAs(services, { role: "MODERATOR" })
    const id = await comment(app, author.headers, owner.userId)
    const res = await api(app, `/users/${owner.userId}/comments/${id}`, {
      method: "DELETE",
      headers: moderator.headers,
    })

    expect(res.status).toBe(200)
  })

  test("rejects empty comments", async ({ app, services }) => {
    const owner = await signInAs(services)
    const author = await signInAs(services)
    const res = await api(app, `/users/${owner.userId}/comments`, {
      method: "POST",
      headers: author.headers,
      json: { content: "   " },
    })

    expect(res.status).toBe(422)
  })
})

describe("GET /users/:id/stats", () => {
  test("hides reading stats when the library is private, except to its owner", async ({
    app,
    services,
  }) => {
    const owner = await signInAs(services)
    const viewer = await signInAs(services)

    await services.db
      .updateTable("users")
      .set({ settings: { showLibrary: false } })
      .where("id", "=", owner.userId)
      .execute()

    const asViewer = await api<{ reading: unknown; uploads: { monthly: unknown[] } }>(
      app,
      `/users/${owner.userId}/stats`,
      { headers: viewer.headers },
    )
    const asOwner = await api<{ reading: unknown }>(app, `/users/${owner.userId}/stats`, {
      headers: owner.headers,
    })

    if (!asViewer.body.success || !asOwner.body.success) {
      throw new Error("Expected success")
    }

    expect(asViewer.body.data.reading).toBeNull()
    expect(asViewer.body.data.uploads.monthly).toHaveLength(12)
    expect(asOwner.body.data.reading).not.toBeNull()
  })
})
