import { sql } from "@taiyomoe/db"
import { refreshMediaSimilarities } from "@taiyomoe/recommendations"
import { describe, expect } from "vitest"
import type { Services } from "../../services"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { seedChapter, seedHistory, seedMedia, seedTitle } from "../helpers/seed"
import { test } from "../setup"

type Recommendation = { id: string; because: { id: string; title: string | null } | null }

const seedTagged = async (services: Services, creatorId: string, tags: string[]) => {
  const id = await seedMedia(services, creatorId)

  await services.db
    .updateTable("medias")
    .set({ tags: tags.map((key) => ({ key, isSpoiler: false })) })
    .where("id", "=", id)
    .execute()

  return id
}

describe("GET /users/me/recommendations", () => {
  test("recommends from the reader's library and leaves out what they know", async ({
    app,
    services,
  }) => {
    const { userId, headers } = await signInAs(services)
    const read = await seedTagged(services, userId, ["VAMPIRE"])
    const dropped = await seedTagged(services, userId, ["VAMPIRE"])
    const similar = await seedTagged(services, userId, ["VAMPIRE"])
    const unrelated = await seedTagged(services, userId, ["SPORTS"])

    await seedTitle(services, {
      mediaId: read,
      creatorId: userId,
      title: "Read",
      isMainTitle: true,
    })
    await refreshMediaSimilarities(services)
    await services.db
      .insertInto("userLibraryEntries")
      .values([
        { userId, mediaId: read, status: "COMPLETED" },
        { userId, mediaId: dropped, status: "DROPPED" },
      ])
      .execute()

    const res = await api<Recommendation[]>(app, "/users/me/recommendations", { headers })

    expect(res.status).toBe(200)

    if (!res.body.success) {
      throw new Error("Expected success")
    }

    const ids = res.body.data.map((media) => media.id)

    expect(res.body.data[0]).toMatchObject({ id: similar, because: { id: read, title: "Read" } })
    expect(ids).not.toContain(read)
    expect(ids).not.toContain(dropped)
    expect(ids.indexOf(similar)).toBeLessThan(
      ids.includes(unrelated) ? ids.indexOf(unrelated) : Number.POSITIVE_INFINITY,
    )
  })

  test("falls back to the most followed titles for a new reader", async ({ app, services }) => {
    const follower = await signInAs(services)
    const popular = await seedMedia(services, follower.userId)

    await services.db
      .insertInto("userLibraryEntries")
      .values({ userId: follower.userId, mediaId: popular, status: "READING" })
      .execute()

    const { headers } = await signInAs(services)
    const res = await api<Recommendation[]>(app, "/users/me/recommendations", { headers })

    expect(res.status).toBe(200)

    if (!res.body.success) {
      throw new Error("Expected success")
    }

    expect(res.body.data.find((media) => media.id === popular)).toMatchObject({ because: null })
  })

  test("ignores history on deleted chapters", async ({ app, services }) => {
    const { userId, headers } = await signInAs(services)
    const read = await seedTagged(services, userId, ["VAMPIRE"])

    await seedTagged(services, userId, ["VAMPIRE"])
    await seedTitle(services, {
      mediaId: read,
      creatorId: userId,
      title: "Read",
      isMainTitle: true,
    })

    const chapter = await seedChapter(services, { mediaId: read, uploaderId: userId, number: 1 })

    await seedHistory(services, userId, chapter)
    await services.db
      .updateTable("chapters")
      .set({ deletedAt: sql`CURRENT_TIMESTAMP` })
      .where("id", "=", chapter)
      .execute()
    await refreshMediaSimilarities(services)

    const res = await api<Recommendation[]>(app, "/users/me/recommendations", { headers })

    if (!res.body.success) {
      throw new Error("Expected success")
    }

    expect(res.body.data.filter((media) => media.because?.id === read)).toEqual([])
  })

  test("requires a signed-in reader", async ({ app }) => {
    const res = await api(app, "/users/me/recommendations")

    expect(res.status).toBe(401)
  })
})

describe("POST /recommendations/events", () => {
  test("records impressions and clicks, with the reader when signed in", async ({
    app,
    services,
  }) => {
    const { userId, headers } = await signInAs(services)
    const source = await seedMedia(services, userId)
    const shown = await seedMedia(services, userId)
    const impression = await api(app, "/recommendations/events", {
      method: "POST",
      headers,
      json: { kind: "IMPRESSION", surface: "RELATED", sourceMediaId: source, mediaIds: [shown] },
    })
    const click = await api(app, "/recommendations/events", {
      method: "POST",
      json: {
        kind: "CLICK",
        surface: "RELATED",
        sourceMediaId: source,
        mediaId: shown,
        position: 0,
      },
    })

    expect(impression.status).toBe(201)
    expect(click.body).toMatchObject({ data: { recorded: true } })
    expect(
      await services.db
        .selectFrom("recommendationImpressions")
        .select(["userId", "mediaIds"])
        .where("sourceMediaId", "=", source)
        .execute(),
    ).toEqual([{ userId, mediaIds: [shown] }])
    expect(
      await services.db
        .selectFrom("recommendationClicks")
        .select(["userId", "mediaId", "position"])
        .where("sourceMediaId", "=", source)
        .execute(),
    ).toEqual([{ userId: null, mediaId: shown, position: 0 }])
  })

  test("ignores a click on a media that does not exist", async ({ app }) => {
    const res = await api(app, "/recommendations/events", {
      method: "POST",
      json: {
        kind: "CLICK",
        surface: "FOR_YOU",
        mediaId: "00000000-0000-0000-0000-000000000000",
        position: 3,
      },
    })

    expect(res.body).toMatchObject({ data: { recorded: false } })
  })
})
