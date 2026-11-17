import { describe, expect } from "vitest"
import type { Services } from "../../services"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { creditChapters, seedReadingTarget } from "../rankings/helpers"
import { test } from "../setup"

type Achievement = {
  key: string
  repeatable: boolean
  criteria: { type: string }
  rewards: { points: number; cosmetics: Array<{ kind: string; key: string }> }
  earned: { count: number; firstEarnedAt: string; lastEarnedAt: string } | null
  progress: { value: number; threshold: number } | null
}

const getAchievements = async (
  app: Parameters<typeof api>[0],
  userId: string,
  headers: Record<string, string> = {},
) => {
  const res = await api<Achievement[]>(app, `/users/${userId}/achievements`, { headers })

  if (!res.body.success) {
    throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
  }

  return new Map(res.body.data.map((achievement) => [achievement.key, achievement]))
}
const seedAchiever = async (services: Services) => {
  const user = await signInAs(services)

  await creditChapters(services, {
    userId: user.userId,
    target: await seedReadingTarget(services),
    at: new Date(),
    chapters: 3,
  })
  await services.db
    .insertInto("userAchievements")
    .values({ userId: user.userId, key: "weeklyPodium", count: 2 })
    .execute()

  return user
}

describe("GET /users/:id/achievements", () => {
  test("lists every achievement with what the user earned and their progress", async ({
    app,
    services,
  }) => {
    const user = await seedAchiever(services)
    const achievements = await getAchievements(app, user.userId)

    expect(achievements.size).toBe(17)
    expect(achievements.get("weeklyPodium")).toMatchObject({
      repeatable: true,
      criteria: { type: "rank", periods: ["WEEK"], rank: 3 },
      earned: { count: 2 },
      progress: null,
    })
    expect(achievements.get("chaptersRead100")).toMatchObject({
      criteria: { type: "metric", metric: "chaptersRead", threshold: 100 },
      rewards: {
        points: 0,
        cosmetics: [
          { kind: "NAME_EFFECT", key: "ember" },
          { kind: "TITLE", key: "bookworm" },
        ],
      },
      earned: null,
      progress: { value: 3, threshold: 100 },
    })
    expect(achievements.get("unstoppable")).toMatchObject({
      criteria: { type: "streak", days: 7 },
      rewards: { points: 300, cosmetics: [{ kind: "TITLE", key: "unstoppable" }] },
    })
  })

  test("hides the chapters read of a user who hides their library", async ({ app, services }) => {
    const user = await seedAchiever(services)
    const viewer = await signInAs(services)

    await services.db
      .updateTable("users")
      .set({ settings: { showLibrary: false } })
      .where("id", "=", user.userId)
      .execute()

    const asViewer = await getAchievements(app, user.userId, viewer.headers)
    const asSelf = await getAchievements(app, user.userId, user.headers)

    expect(asViewer.get("chaptersRead100")?.progress).toBeNull()
    expect(asViewer.get("chaptersUploaded10")?.progress).toEqual({ value: 0, threshold: 10 })
    expect(asSelf.get("chaptersRead100")?.progress).toEqual({ value: 3, threshold: 100 })
  })

  test("returns USER_NOT_FOUND for a banned or unknown user", async ({ app, services }) => {
    const banned = await signInAs(services, { banned: true })

    for (const id of [banned.userId, "00000000-0000-0000-0000-000000000000"]) {
      const res = await api(app, `/users/${id}/achievements`)

      expect(res.status).toBe(404)
      expect(!res.body.success && res.body.code).toBe("USER_NOT_FOUND")
    }
  })

  test("returns VALIDATION_ERROR for a malformed ID", async ({ app }) => {
    const res = await api(app, "/users/not-a-uuid/achievements")

    expect(res.status).toBe(422)
  })
})
