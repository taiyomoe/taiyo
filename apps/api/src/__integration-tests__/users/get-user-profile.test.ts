import { describe, expect } from "vitest"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { seedGroup, seedMembership } from "../helpers/seed"
import { test } from "../setup"

type Profile = {
  id: string
  username: string
  followerCount: number
  followingCount: number
  viewerFollows: boolean | null
  groups: Array<{ id: string; name: string; role: string }>
}

const usernameOf = async (services: Parameters<typeof signInAs>[0], id: string) =>
  (
    await services.db
      .selectFrom("users")
      .select("username")
      .where("id", "=", id)
      .executeTakeFirstOrThrow()
  ).username

describe("GET /users/by-username/:username", () => {
  test("returns the profile with follow counts and groups", async ({ app, services }) => {
    const target = await signInAs(services)
    const follower = await signInAs(services)
    const groupId = await seedGroup(services, target.userId, "Profile Scans")

    await seedMembership(services, { groupId, userId: target.userId, role: "OWNER" })
    await services.db
      .insertInto("userFollows")
      .values({ followerId: follower.userId, followingId: target.userId })
      .execute()

    const username = await usernameOf(services, target.userId)
    const anonymous = await api<Profile>(app, `/users/by-username/${username.toUpperCase()}`)
    const signedIn = await api<Profile>(app, `/users/by-username/${username}`, {
      headers: follower.headers,
    })

    if (!anonymous.body.success || !signedIn.body.success) {
      throw new Error("Expected success")
    }

    expect(anonymous.body.data).toMatchObject({
      id: target.userId,
      followerCount: 1,
      followingCount: 0,
      viewerFollows: null,
      groups: [{ id: groupId, name: "Profile Scans", role: "OWNER" }],
    })
    expect(signedIn.body.data.viewerFollows).toBe(true)
  })

  test("does not find banned users", async ({ app, services }) => {
    const banned = await signInAs(services, { banned: true })
    const res = await api(app, `/users/by-username/${await usernameOf(services, banned.userId)}`)

    expect(res.status).toBe(404)
  })
})
