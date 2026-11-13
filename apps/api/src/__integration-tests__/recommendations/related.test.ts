import { config } from "@taiyomoe/config"
import { refreshMediaSimilarities } from "@taiyomoe/recommendations"
import { describe, expect } from "vitest"
import type { Services } from "../../services"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { seedMedia, seedTitle } from "../helpers/seed"
import { test } from "../setup"

type Related = {
  relations: Array<{ id: string; title: string | null; relationType: string }>
  similar: Array<{
    id: string
    libraryStatus: string | null
    reasons: { tags: string[]; staff: boolean; readers: boolean }
  }>
}

const tagged = async (services: Services, creatorId: string, tags: string[], title: string) => {
  const id = await seedMedia(services, creatorId)

  await services.db
    .updateTable("medias")
    .set({ tags: tags.map((key) => ({ key, isSpoiler: false })) })
    .where("id", "=", id)
    .execute()
  await seedTitle(services, { mediaId: id, creatorId, title, isMainTitle: true })

  return id
}

describe("GET /medias/:id/related", () => {
  test("lists relations, then similar titles with their reasons", async ({ app, services }) => {
    const { userId } = await signInAs(services, { role: "ADMIN" })
    const source = await tagged(services, userId, ["FOOD", "ROMANCE"], "Source")
    const sequel = await tagged(services, userId, ["FOOD", "ROMANCE"], "Sequel")
    const similar = await tagged(services, userId, ["FOOD", "ROMANCE"], "Similar")

    await services.db
      .insertInto("mediaRelations")
      .values([
        { mediaId: source, relatedMediaId: sequel, type: "SEQUEL" },
        { mediaId: sequel, relatedMediaId: source, type: "PREQUEL" },
      ])
      .execute()
    await refreshMediaSimilarities(services)

    const res = await api<Related>(app, `/medias/${source}/related`)

    expect(res.status).toBe(200)

    if (!res.body.success) {
      throw new Error("Expected success")
    }

    expect(res.body.data.relations).toEqual([
      expect.objectContaining({ id: sequel, title: "Sequel", relationType: "SEQUEL" }),
    ])
    expect(res.body.data.similar.map((media) => media.id)).toContain(similar)
    expect(res.body.data.similar.map((media) => media.id)).not.toContain(sequel)
    expect(res.body.data.similar.find((media) => media.id === similar)?.reasons.tags).toEqual(
      expect.arrayContaining(["ROMANCE"]),
    )
  })

  test("hides titles outside the requested ratings and puts what the reader read last", async ({
    app,
    services,
  }) => {
    const { userId, headers } = await signInAs(services)
    const source = await tagged(services, userId, ["ZOMBIE", "SURVIVAL"], "Source")
    const read = await tagged(services, userId, ["ZOMBIE", "SURVIVAL"], "Read")
    const fresh = await tagged(services, userId, ["ZOMBIE", "SURVIVAL"], "Fresh")
    const explicit = await tagged(services, userId, ["ZOMBIE", "SURVIVAL"], "Explicit")

    await services.db
      .updateTable("medias")
      .set({ contentRating: "NSFW" })
      .where("id", "=", explicit)
      .execute()
    await refreshMediaSimilarities(services)
    await services.db
      .insertInto("userLibraryEntries")
      .values({ userId, mediaId: read, status: "COMPLETED" })
      .execute()

    const res = await api<Related>(app, `/medias/${source}/related?contentRating=NORMAL`, {
      headers,
    })

    if (!res.body.success) {
      throw new Error("Expected success")
    }

    const ids = res.body.data.similar.map((media) => media.id)

    expect(ids).not.toContain(explicit)
    expect(ids.indexOf(fresh)).toBeLessThan(ids.indexOf(read))
    expect(res.body.data.similar.find((media) => media.id === read)?.libraryStatus).toBe(
      "COMPLETED",
    )
  })

  test("returns MEDIA_NOT_FOUND for a missing media", async ({ app }) => {
    const res = await api(app, "/medias/00000000-0000-0000-0000-000000000000/related")

    expect(res.status).toBe(404)
  })
})

describe("PATCH /medias/:id relations", () => {
  test("stores each relation in both directions and replaces them as a whole", async ({
    app,
    services,
  }) => {
    const { userId, headers } = await signInAs(services, { role: "ADMIN" })
    const media = await seedMedia(services, userId)
    const sequel = await seedMedia(services, userId)
    const original = await seedMedia(services, userId)
    const rows = () =>
      services.db
        .selectFrom("mediaRelations")
        .select(["mediaId", "relatedMediaId", "type"])
        .where((eb) => eb.or([eb("mediaId", "=", media), eb("relatedMediaId", "=", media)]))
        .orderBy("type")
        .execute()
    const first = await api(app, `/medias/${media}`, {
      method: "PATCH",
      headers,
      json: {
        relations: [
          { mediaId: sequel, type: "SEQUEL" },
          { mediaId: original, type: "ORIGINAL" },
        ],
      },
    })

    expect(first.status).toBe(200)
    expect(await rows()).toEqual(
      expect.arrayContaining([
        { mediaId: media, relatedMediaId: sequel, type: "SEQUEL" },
        { mediaId: sequel, relatedMediaId: media, type: "PREQUEL" },
        { mediaId: media, relatedMediaId: original, type: "ORIGINAL" },
        { mediaId: original, relatedMediaId: media, type: "ADAPTATION" },
      ]),
    )

    await api(app, `/medias/${media}`, {
      method: "PATCH",
      headers,
      json: { relations: [{ mediaId: sequel, type: "SIDE_STORY" }] },
    })

    expect(await rows()).toEqual([
      { mediaId: sequel, relatedMediaId: media, type: "MAIN_STORY" },
      { mediaId: media, relatedMediaId: sequel, type: "SIDE_STORY" },
    ])

    const edit = await api<{ current: { relations: unknown[] } }>(app, `/medias/${media}/edit`, {
      headers,
    })

    expect(edit.body).toMatchObject({
      data: { current: { relations: [{ mediaId: sequel, type: "SIDE_STORY" }] } },
    })
  })

  test("rejects a relation to itself or to a missing media", async ({ app, services }) => {
    const { userId, headers } = await signInAs(services, { role: "ADMIN" })
    const media = await seedMedia(services, userId)
    const self = await api(app, `/medias/${media}`, {
      method: "PATCH",
      headers,
      json: { relations: [{ mediaId: media, type: "SEQUEL" }] },
    })
    const missing = await api(app, `/medias/${media}`, {
      method: "PATCH",
      headers,
      json: { relations: [{ mediaId: "00000000-0000-0000-0000-000000000000", type: "SEQUEL" }] },
    })

    expect(self.status).toBe(422)
    expect(self.body).toMatchObject({ code: "MEDIA_INVALID_RELATIONS" })
    expect(missing.body).toMatchObject({ code: "MEDIA_INVALID_RELATIONS" })
  })

  test("rejects a relation to a media that is already full", async ({ app, services }) => {
    const { userId, headers } = await signInAs(services, { role: "ADMIN" })
    const full = await seedMedia(services, userId)
    const others = await Promise.all(
      Array.from({ length: config.input.maxMediaRelations }, () => seedMedia(services, userId)),
    )
    const media = await seedMedia(services, userId)

    await services.db
      .insertInto("mediaRelations")
      .values(
        others.flatMap((other) => [
          { mediaId: full, relatedMediaId: other, type: "SAME_FRANCHISE" as const },
          { mediaId: other, relatedMediaId: full, type: "SAME_FRANCHISE" as const },
        ]),
      )
      .execute()

    const rejected = await api(app, `/medias/${media}`, {
      method: "PATCH",
      headers,
      json: { relations: [{ mediaId: full, type: "SEQUEL" }] },
    })
    const trimmed = await api(app, `/medias/${full}`, {
      method: "PATCH",
      headers,
      json: {
        relations: others.slice(1).map((other) => ({ mediaId: other, type: "SAME_FRANCHISE" })),
      },
    })

    expect(rejected.status).toBe(422)
    expect(rejected.body).toMatchObject({ code: "MEDIA_INVALID_RELATIONS" })
    expect(trimmed.status).toBe(200)
  })
})
