import { describe, expect } from "vitest"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import {
  seedChapter,
  seedGroup,
  seedHistory,
  seedMedia,
  seedMembership,
  seedTitle,
} from "../helpers/seed"
import { test } from "../setup"

const daysAgo = (days: number) => new Date(Date.now() - days * 86_400_000)
const seedLibrary = async (services: Parameters<typeof seedMedia>[0]) => {
  const { userId } = await signInAs(services)
  const groupId = await seedGroup(services, userId, `content-${userId}`)
  const alpha = await seedMedia(services, userId)
  const beta = await seedMedia(services, userId)

  await seedMembership(services, { groupId, userId, role: "OWNER" })
  await seedTitle(services, {
    mediaId: alpha,
    creatorId: userId,
    title: "Alpha Saga",
    isMainTitle: true,
  })
  await seedTitle(services, {
    mediaId: beta,
    creatorId: userId,
    title: "Beta Tales",
    isMainTitle: true,
  })

  const chapters = [
    await seedChapter(services, {
      mediaId: alpha,
      uploaderId: userId,
      number: 1,
      createdAt: daysAgo(30),
      groupIds: [groupId],
      pages: [{ id: "a" }, { id: "b" }],
    }),
    await seedChapter(services, {
      mediaId: alpha,
      uploaderId: userId,
      number: 2,
      createdAt: daysAgo(20),
      groupIds: [groupId],
      title: "The gate opens",
    }),
    await seedChapter(services, {
      mediaId: alpha,
      uploaderId: userId,
      number: 3,
      createdAt: daysAgo(10),
      groupIds: [groupId],
      language: "fr",
    }),
    await seedChapter(services, {
      mediaId: beta,
      uploaderId: userId,
      number: 7,
      createdAt: daysAgo(1),
      groupIds: [groupId],
    }),
  ]

  await seedChapter(services, {
    mediaId: beta,
    uploaderId: userId,
    number: 8,
    createdAt: daysAgo(0),
  })
  await seedHistory(services, userId, chapters[0] ?? "")
  await seedHistory(services, userId, chapters[1] ?? "")

  return { userId, groupId, alpha, beta }
}

describe("group page content", () => {
  test("summarises the group", async ({ app, services }) => {
    const { groupId } = await seedLibrary(services)
    const res = await api(app, `/groups/${groupId}`)

    expect(res.body).toMatchObject({
      data: {
        owned: true,
        chapterCount: 4,
        mediaCount: 2,
        memberCount: 1,
        followerCount: 0,
        commentCount: 0,
        languages: ["en", "fr"],
      },
    })
  })

  test("lists the group's medias in each order", async ({ app, services }) => {
    const { groupId, alpha, beta } = await seedLibrary(services)
    const ids = async (sort: string) => {
      const res = await api<Array<{ id: string }>>(app, `/groups/${groupId}/medias?sort=${sort}`)

      if (!res.body.success) {
        throw new Error(JSON.stringify(res.body))
      }

      return res.body.data.map((media) => media.id)
    }

    expect(await ids("recent")).toEqual([beta, alpha])
    expect(await ids("chapters")).toEqual([alpha, beta])
    expect(await ids("title")).toEqual([alpha, beta])

    const res = await api(app, `/groups/${groupId}/medias?sort=chapters`)

    expect(res.body).toMatchObject({
      data: [
        { title: "Alpha Saga", chapterCount: 3, latestNumber: 3 },
        { chapterCount: 1, latestNumber: 7 },
      ],
      meta: { total: 2 },
    })
  })

  test("aggregates the group's stats", async ({ app, services }) => {
    const { groupId, alpha, userId } = await seedLibrary(services)
    const res = await api<{
      averageDaysBetweenReleases: number
      monthly: Array<{ count: number }>
    }>(app, `/groups/${groupId}/stats`)

    if (!res.body.success) {
      throw new Error(JSON.stringify(res.body))
    }

    expect(res.body.data).toMatchObject({
      chapterCount: 4,
      pageCount: 2,
      readCount: 2,
      topUploaders: [{ id: userId, count: 4 }],
      mostRead: [{ id: alpha, title: "Alpha Saga", readCount: 2 }],
    })
    expect(res.body.data.averageDaysBetweenReleases).toBeCloseTo(29 / 3, 1)
    expect(res.body.data.monthly).toHaveLength(12)
    expect(res.body.data.monthly.reduce((sum, month) => sum + month.count, 0)).toBe(4)
  })

  test("filters and orders the latest updates of a group", async ({ app, services }) => {
    const { groupId, alpha, beta } = await seedLibrary(services)
    const numbers = (chapters: Array<{ number: number }>) => chapters.map((c) => c.number)
    const fetch = async (query: string) => {
      const res = await api<Array<{ id: string; chapters: Array<{ number: number }> }>>(
        app,
        `/chapters/latest/medias?groupId=${groupId}&${query}`,
      )

      if (!res.body.success) {
        throw new Error(JSON.stringify(res.body))
      }

      return res.body.data.map((media) => [media.id, numbers(media.chapters)])
    }

    expect(await fetch("order=latest")).toEqual([
      [beta, [7]],
      [alpha, [3, 2, 1]],
    ])
    expect(await fetch("order=oldest")).toEqual([
      [alpha, [1, 2, 3]],
      [beta, [7]],
    ])
    expect(await fetch("search=gate")).toEqual([[alpha, [2]]])
    expect(await fetch("search=beta")).toEqual([[beta, [7]]])
    expect(await fetch("search=Ch.%203")).toEqual([[alpha, [3]]])
    expect(await fetch(`mediaId=${alpha}`)).toEqual([[alpha, [3, 2, 1]]])
  })

  test("counts the chapters each member uploaded", async ({ app, services }) => {
    const { groupId, userId } = await seedLibrary(services)
    const res = await api(app, `/groups/${groupId}/members`)

    expect(res.body).toMatchObject({ data: [{ userId, chapterCount: 4 }] })
  })
})
