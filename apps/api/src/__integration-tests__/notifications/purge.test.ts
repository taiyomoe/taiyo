import { purgeNotifications } from "@taiyomoe/queue"
import { sql } from "kysely"
import { describe, expect } from "vitest"
import type { Services } from "../../services"
import { signInAs } from "../helpers/auth"
import { test } from "../setup"

const daysAgo = (days: number) =>
  sql<Date>`(CURRENT_TIMESTAMP AT TIME ZONE 'UTC') - make_interval(days => ${days})`
const seedFollow = async (
  { db }: Services,
  userId: string,
  dates: { readAt?: number; createdAt?: number },
) => {
  await db
    .insertInto("notifications")
    .values({
      userId,
      type: "FOLLOW",
      ...(dates.createdAt === undefined ? {} : { createdAt: daysAgo(dates.createdAt) }),
      ...(dates.readAt === undefined ? {} : { readAt: daysAgo(dates.readAt) }),
    })
    .execute()
}

describe("purgeNotifications", () => {
  test("purges notifications read or created past their retention and keeps the rest", async ({
    services,
  }) => {
    const readLongAgo = await signInAs(services)
    const unreadLongAgo = await signInAs(services)
    const recentlyRead = await signInAs(services)

    await seedFollow(services, readLongAgo.userId, { readAt: 91 })
    await seedFollow(services, unreadLongAgo.userId, { createdAt: 366 })
    await seedFollow(services, recentlyRead.userId, { createdAt: 100, readAt: 10 })

    expect(await purgeNotifications(services)).toEqual({ purged: 2 })

    const remaining = await services.db
      .selectFrom("notifications")
      .select("userId")
      .where("userId", "in", [readLongAgo.userId, unreadLongAgo.userId, recentlyRead.userId])
      .execute()

    expect(remaining).toEqual([{ userId: recentlyRead.userId }])
  })
})
