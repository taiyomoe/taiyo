import { describe, expect } from "vitest"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { test } from "../setup"

type Account = { username: string; displayUsername: string; name: string }

const handleOf = (userId: string) => `u${userId.replace(/-/g, "").slice(0, 12)}`

describe("PATCH /users/me/account", () => {
  test("requires a signed-in user", async ({ app }) => {
    const res = await api(app, "/users/me/account", {
      method: "PATCH",
      json: { username: "someone" },
    })

    expect(res.status).toBe(401)
  })

  test("renames the user and lowercases the username", async ({ app, services }) => {
    const { userId, headers } = await signInAs(services)
    const suffix = userId.slice(0, 6)
    const res = await api<Account>(app, "/users/me/account", {
      method: "PATCH",
      headers,
      json: { username: `New_Handle${suffix}`, displayName: `Sunny ${suffix}` },
    })

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    expect(res.body.data).toEqual({
      username: `new_handle${suffix}`.toLowerCase(),
      displayUsername: `Sunny ${suffix}`,
      name: `Sunny ${suffix}`,
    })

    const user = await services.db
      .selectFrom("users")
      .select(["username", "displayUsername", "name"])
      .where("id", "=", userId)
      .executeTakeFirstOrThrow()

    expect(user).toEqual(res.body.data)
  })

  test("rejects a username someone else has", async ({ app, services }) => {
    const other = await signInAs(services)
    const { headers } = await signInAs(services)
    const res = await api(app, "/users/me/account", {
      method: "PATCH",
      headers,
      json: { username: handleOf(other.userId).toUpperCase() },
    })

    expect(res.status).toBe(409)
    expect(res.body).toMatchObject({ success: false, code: "USERNAME_TAKEN" })
  })

  test("rejects a display name someone else has, ignoring case", async ({ app, services }) => {
    const other = await signInAs(services)
    const { headers } = await signInAs(services)
    const res = await api(app, "/users/me/account", {
      method: "PATCH",
      headers,
      json: { displayName: handleOf(other.userId).toUpperCase() },
    })

    expect(res.status).toBe(409)
    expect(res.body).toMatchObject({ success: false, code: "DISPLAY_NAME_TAKEN" })
  })

  test("keeps the user's own names when they are sent back unchanged", async ({
    app,
    services,
  }) => {
    const { userId, headers } = await signInAs(services)
    const res = await api(app, "/users/me/account", {
      method: "PATCH",
      headers,
      json: { username: handleOf(userId), displayName: handleOf(userId) },
    })

    expect(res.status).toBe(200)
  })

  test("rejects a username with spaces", async ({ app, services }) => {
    const { headers } = await signInAs(services)
    const res = await api(app, "/users/me/account", {
      method: "PATCH",
      headers,
      json: { username: "has space" },
    })

    expect(res.status).toBe(422)
  })
})

describe("POST /users/me/password", () => {
  test("adds a password once, then asks to change it instead", async ({ app, services }) => {
    const { userId, headers } = await signInAs(services)
    const first = await api(app, "/users/me/password", {
      method: "POST",
      headers,
      json: { newPassword: "a-long-password" },
    })

    expect(first.status).toBe(201)

    const credential = await services.db
      .selectFrom("accounts")
      .select("password")
      .where("userId", "=", userId)
      .where("providerId", "=", "credential")
      .executeTakeFirst()

    expect(credential?.password).toEqual(expect.any(String))

    const second = await api(app, "/users/me/password", {
      method: "POST",
      headers,
      json: { newPassword: "another-password" },
    })

    expect(second.status).toBe(409)
    expect(second.body).toMatchObject({ success: false, code: "PASSWORD_ALREADY_SET" })
  })

  test("rejects a short password", async ({ app, services }) => {
    const { headers } = await signInAs(services)
    const res = await api(app, "/users/me/password", {
      method: "POST",
      headers,
      json: { newPassword: "short" },
    })

    expect(res.status).toBe(422)
  })
})

describe("display name spacing", () => {
  test("refuses whitespace that would render like another name", async ({ app, services }) => {
    const { headers } = await signInAs(services)

    for (const displayName of ["Test\u00a0Admin", "Test  Admin", "Test\u3000Admin"]) {
      const res = await api(app, "/users/me/account", {
        method: "PATCH",
        headers,
        json: { displayName },
      })

      expect(res.status).toBe(422)
    }
  })
})

describe("showFollowing", () => {
  test("hides who the user follows from everyone but them", async ({ app, services }) => {
    const owner = await signInAs(services)
    const viewer = await signInAs(services)
    const followee = await signInAs(services)

    await services.db
      .insertInto("userFollows")
      .values({ followerId: owner.userId, followingId: followee.userId })
      .execute()

    const saved = await api(app, "/users/me/settings", {
      method: "PATCH",
      headers: owner.headers,
      json: { showFollowing: false },
    })

    expect(saved.status).toBe(200)

    const hidden = await api<unknown[]>(app, `/users/${owner.userId}/following`, {
      headers: viewer.headers,
    })
    const own = await api<unknown[]>(app, `/users/${owner.userId}/following`, {
      headers: owner.headers,
    })
    const profile = await api<{ followingHidden: boolean }>(
      app,
      `/users/by-username/${handleOf(owner.userId)}`,
      { headers: viewer.headers },
    )

    if (!hidden.body.success || !own.body.success || !profile.body.success) {
      throw new Error("Expected success")
    }

    expect(hidden.body.data).toEqual([])
    expect(own.body.data).toHaveLength(1)
    expect(profile.body.data.followingHidden).toBe(true)

    const followerIds = async (headers: Record<string, string> = {}) => {
      const res = await api<Array<{ id: string }>>(app, `/users/${followee.userId}/followers`, {
        headers,
      })

      if (!res.body.success) {
        throw new Error("Expected success")
      }

      return res.body.data.map((follower) => follower.id)
    }

    expect(await followerIds()).not.toContain(owner.userId)
    expect(await followerIds(viewer.headers)).not.toContain(owner.userId)
    expect(await followerIds(owner.headers)).toContain(owner.userId)
    expect(await followerIds(followee.headers)).toContain(owner.userId)
  })
})
