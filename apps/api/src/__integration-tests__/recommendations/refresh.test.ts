import { sql } from "@taiyomoe/db"
import { refreshMediaSimilarities } from "@taiyomoe/recommendations"
import { describe, expect } from "vitest"
import type { Services } from "../../services"
import { signInAs } from "../helpers/auth"
import { seedMedia } from "../helpers/seed"
import { test } from "../setup"

const seedTagged = async (services: Services, creatorId: string, tags: string[]) => {
  const id = await seedMedia(services, creatorId)

  await services.db
    .updateTable("medias")
    .set({ tags: tags.map((key) => ({ key, isSpoiler: false })) })
    .where("id", "=", id)
    .execute()

  return id
}
const daysAgo = (days: number) =>
  sql<Date>`(CURRENT_TIMESTAMP at time zone 'UTC') - make_interval(days => ${days})`

describe("refreshMediaSimilarities", () => {
  test("only rewrites lists that changed", async ({ services }) => {
    const { userId } = await signInAs(services)

    await seedTagged(services, userId, ["VAMPIRE"])
    await seedTagged(services, userId, ["VAMPIRE"])

    const first = await refreshMediaSimilarities(services)
    const second = await refreshMediaSimilarities(services)

    expect(first.written).toBeGreaterThanOrEqual(2)
    expect(second.written).toBe(0)
  })

  test("drops the list of a deleted media", async ({ services }) => {
    const { userId } = await signInAs(services)
    const kept = await seedTagged(services, userId, ["VAMPIRE"])
    const deleted = await seedTagged(services, userId, ["VAMPIRE"])
    const listed = () =>
      services.db
        .selectFrom("mediaSimilarities")
        .select("mediaId")
        .where("mediaId", "in", [kept, deleted])
        .orderBy("mediaId")
        .execute()

    await refreshMediaSimilarities(services)

    expect(await listed()).toHaveLength(2)

    await services.db
      .updateTable("medias")
      .set({ deletedAt: sql`CURRENT_TIMESTAMP` })
      .where("id", "=", deleted)
      .execute()
    await refreshMediaSimilarities(services)

    expect(await listed()).toEqual([{ mediaId: kept }])
  })

  test("purges events older than 180 days", async ({ services }) => {
    const { userId } = await signInAs(services)
    const media = await seedMedia(services, userId)

    await services.db
      .insertInto("recommendationImpressions")
      .values([
        { surface: "RELATED", mediaIds: [media], createdAt: daysAgo(200) },
        { surface: "RELATED", mediaIds: [media], createdAt: daysAgo(10) },
      ])
      .execute()
    await services.db
      .insertInto("recommendationClicks")
      .values([
        { surface: "RELATED", mediaId: media, position: 0, createdAt: daysAgo(200) },
        { surface: "RELATED", mediaId: media, position: 1, createdAt: daysAgo(10) },
      ])
      .execute()
    await refreshMediaSimilarities(services)

    const impressions = await services.db
      .selectFrom("recommendationImpressions")
      .select(
        sql<boolean>`"createdAt" > (CURRENT_TIMESTAMP at time zone 'UTC') - interval '180 days'`.as(
          "recent",
        ),
      )
      .execute()
    const clicks = await services.db
      .selectFrom("recommendationClicks")
      .select("position")
      .where("mediaId", "=", media)
      .execute()

    expect(impressions).toEqual([{ recent: true }])
    expect(clicks).toEqual([{ position: 1 }])
  })
})
