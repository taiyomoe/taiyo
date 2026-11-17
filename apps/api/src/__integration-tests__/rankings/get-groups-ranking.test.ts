import { sql } from "@taiyomoe/db"
import { describe, expect } from "vitest"
import type { Services } from "../../services"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { seedChapter, seedGroup, seedMedia, seedMembership } from "../helpers/seed"
import { test } from "../setup"

type Ranking = {
  total: number
  entries: Array<{
    rank: number
    value: number
    medias: number
    group: { id: string; name: string; logoUrl: string | null; memberCount: number }
  }>
  me: {
    rank: number
    value: number
    group: { id: string }
    above: { group: { id: string }; value: number; gap: number } | null
  } | null
}

const getRanking = async (
  app: Parameters<typeof api>[0],
  query: string,
  headers: Record<string, string>,
) => {
  const res = await api<Ranking>(app, `/rankings/groups${query}`, { headers })

  if (!res.body.success) {
    throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
  }

  return res.body.data
}
const seedGroups = async (services: Services) => {
  // The seeded chapters came out when the test template was built, this week: age them out.
  await services.db
    .updateTable("chapters")
    .set({ createdAt: sql<Date>`"createdAt" - interval '400 days'` })
    .execute()

  const { userId: uploaderId } = await signInAs(services, { role: "UPLOADER" })
  const member = await signInAs(services)
  const [firstMedia, secondMedia] = await Promise.all([
    seedMedia(services, uploaderId),
    seedMedia(services, uploaderId),
  ])
  const [leader, mine, gone] = await Promise.all([
    seedGroup(services, uploaderId, "Leader Scans"),
    seedGroup(services, uploaderId, "Member Scans"),
    seedGroup(services, uploaderId, "Gone Scans"),
  ])
  const release = (groupId: string, mediaId: string, number: number) =>
    seedChapter(services, { mediaId, uploaderId, number, groupIds: [groupId] })

  await release(leader, firstMedia, 1)
  await release(leader, firstMedia, 2)
  await release(leader, secondMedia, 1)
  await release(mine, secondMedia, 2)

  for (let number = 10; number < 15; number++) {
    await release(gone, firstMedia, number)
  }

  await seedChapter(services, {
    mediaId: firstMedia,
    uploaderId,
    number: 20,
    groupIds: [mine],
    status: "SCHEDULED",
    publishInHours: 24,
  })

  const deleted = await release(mine, firstMedia, 21)

  await services.db
    .updateTable("chapters")
    .set({ deletedAt: new Date() })
    .where("id", "=", deleted)
    .execute()
  await services.db
    .updateTable("groups")
    .set({ deletedAt: new Date() })
    .where("id", "=", gone)
    .execute()
  await seedMembership(services, { groupId: leader, userId: uploaderId, role: "OWNER" })
  await seedMembership(services, { groupId: leader, userId: member.userId })
  await seedMembership(services, { groupId: mine, userId: member.userId })
  await seedMembership(services, { groupId: gone, userId: member.userId })

  return { leader, mine, member }
}

describe("GET /rankings/groups", () => {
  test("ranks live groups by the chapters they released this week", async ({ app, services }) => {
    const { leader, mine } = await seedGroups(services)
    const outsider = await signInAs(services)
    const ranking = await getRanking(app, "", outsider.headers)

    expect(ranking.total).toBe(2)
    expect(ranking.me).toBeNull()
    expect(ranking.entries).toEqual([
      {
        rank: 1,
        value: 3,
        medias: 2,
        group: { id: leader, name: "Leader Scans", logoUrl: null, memberCount: 2 },
      },
      {
        rank: 2,
        value: 1,
        medias: 1,
        group: { id: mine, name: "Member Scans", logoUrl: null, memberCount: 1 },
      },
    ])
  })

  test("returns the standing of your best-ranked group", async ({ app, services }) => {
    const { leader, mine, member } = await seedGroups(services)
    const outsider = await signInAs(services)
    const ranking = await getRanking(app, "", member.headers)

    expect(ranking.me).toEqual({
      rank: 1,
      value: 3,
      group: { id: leader, name: "Leader Scans", logoUrl: null },
      above: null,
    })

    await services.db
      .deleteFrom("groupMemberships")
      .where("userId", "=", member.userId)
      .where("groupId", "=", leader)
      .execute()

    expect((await getRanking(app, "", member.headers)).me).toEqual({
      rank: 2,
      value: 1,
      group: { id: mine, name: "Member Scans", logoUrl: null },
      above: { group: { id: leader, name: "Leader Scans" }, value: 3, gap: 3 },
    })
    expect((await getRanking(app, "", outsider.headers)).me).toBeNull()
  })

  test("counts every release for all time", async ({ app, services }) => {
    const { member } = await seedGroups(services)
    const ranking = await getRanking(app, "?period=all", member.headers)

    expect(ranking.total).toBeGreaterThan(2)
    expect(ranking.entries.length).toBeLessThanOrEqual(10)
  })

  test("returns VALIDATION_ERROR for an unknown period", async ({ app, services }) => {
    const { headers } = await signInAs(services)
    const res = await api(app, "/rankings/groups?period=day", { headers })

    expect(res.status).toBe(422)
  })

  test("returns UNAUTHORIZED without a session", async ({ app }) => {
    const res = await api(app, "/rankings/groups")

    expect(res.status).toBe(401)
    expect(!res.body.success && res.body.code).toBe("UNAUTHORIZED")
  })

  test("returns FORBIDDEN for a banned user", async ({ app, services }) => {
    const { headers } = await signInAs(services, { banned: true })
    const res = await api(app, "/rankings/groups", { headers })

    expect(res.status).toBe(403)
    expect(!res.body.success && res.body.code).toBe("FORBIDDEN")
  })
})
