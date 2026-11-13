import { syncMediaRelations } from "@taiyomoe/recommendations"
import { randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import type { Services } from "../../services"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { seedMedia } from "../helpers/seed"
import { test } from "../setup"

const linkedMedia = async (services: Services, creatorId: string) => {
  const id = await seedMedia(services, creatorId)
  const mangaDexId = randomUUID()

  await services.db
    .updateTable("medias")
    .set({ links: { mangaDex: mangaDexId } })
    .where("id", "=", id)
    .execute()

  return { id, mangaDexId }
}

describe("syncMediaRelations", () => {
  test("imports MangaDex relations once, in both directions", async ({ app, services }) => {
    const { userId, headers } = await signInAs(services, { role: "ADMIN" })
    const main = await linkedMedia(services, userId)
    const sequel = await linkedMedia(services, userId)
    let requests = 0
    const fetcher: typeof fetch = () => {
      requests++

      return Promise.resolve(
        Response.json({
          data: [
            {
              id: main.mangaDexId,
              relationships: [
                { id: sequel.mangaDexId, type: "manga", related: "sequel" },
                { id: randomUUID(), type: "manga", related: "doujinshi" },
              ],
            },
            {
              id: sequel.mangaDexId,
              relationships: [{ id: main.mangaDexId, type: "manga", related: "prequel" }],
            },
          ],
        }),
      )
    }
    const rows = () =>
      services.db
        .selectFrom("mediaRelations")
        .select(["mediaId", "relatedMediaId", "type"])
        .where("mediaId", "in", [main.id, sequel.id])
        .orderBy("type")
        .execute()

    expect(await syncMediaRelations({ db: services.db, fetcher })).toMatchObject({ relations: 1 })
    expect(await rows()).toEqual([
      { mediaId: sequel.id, relatedMediaId: main.id, type: "PREQUEL" },
      { mediaId: main.id, relatedMediaId: sequel.id, type: "SEQUEL" },
    ])

    await api(app, `/medias/${main.id}`, { method: "PATCH", headers, json: { relations: [] } })

    const before = requests

    await syncMediaRelations({ db: services.db, fetcher })

    expect(requests).toBe(before)
    expect(await rows()).toEqual([])
  })

  test("never re-imports a relation an editor removed, from either side", async ({
    app,
    services,
  }) => {
    const { userId, headers } = await signInAs(services, { role: "ADMIN" })
    const main = await linkedMedia(services, userId)
    const sequel = await linkedMedia(services, userId)
    let imported = 0
    const fetcher: typeof fetch = (input) => {
      const ids = input instanceof URL ? input.searchParams.getAll("ids[]") : []

      imported += Number(ids.includes(sequel.mangaDexId))

      return Promise.resolve(
        Response.json({
          data: ids.includes(sequel.mangaDexId)
            ? [
                {
                  id: sequel.mangaDexId,
                  relationships: [{ id: main.mangaDexId, type: "manga", related: "prequel" }],
                },
              ]
            : [],
        }),
      )
    }
    const added = await api(app, `/medias/${main.id}`, {
      method: "PATCH",
      headers,
      json: { relations: [{ mediaId: sequel.id, type: "SEQUEL" }] },
    })
    const removed = await api(app, `/medias/${main.id}`, {
      method: "PATCH",
      headers,
      json: { relations: [] },
    })

    expect(added.status).toBe(200)
    expect(removed.status).toBe(200)

    await syncMediaRelations({ db: services.db, fetcher })

    expect(imported).toBe(0)
    expect(
      await services.db
        .selectFrom("mediaRelations")
        .select("mediaId")
        .where("mediaId", "in", [main.id, sequel.id])
        .execute(),
    ).toEqual([])
  })

  test("stops importing relations at the cap", async ({ services }) => {
    const { userId } = await signInAs(services, { role: "ADMIN" })
    const main = await linkedMedia(services, userId)
    const first = await linkedMedia(services, userId)
    const second = await linkedMedia(services, userId)
    const fetcher: typeof fetch = () =>
      Promise.resolve(
        Response.json({
          data: [
            {
              id: main.mangaDexId,
              relationships: [
                { id: first.mangaDexId, type: "manga", related: "sequel" },
                { id: second.mangaDexId, type: "manga", related: "side_story" },
              ],
            },
          ],
        }),
      )

    expect(await syncMediaRelations({ db: services.db, fetcher, maxRelations: 1 })).toMatchObject({
      relations: 1,
    })
    expect(
      await services.db
        .selectFrom("mediaRelations")
        .select("relatedMediaId")
        .where("mediaId", "=", main.id)
        .execute(),
    ).toEqual([{ relatedMediaId: first.id }])
  })
})
