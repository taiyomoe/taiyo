import { drainSearchOutbox } from "@taiyomoe/search"
import { describe, expect } from "vitest"
import type { Services } from "../../services"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { waitForMediaDoc } from "../helpers/wait"
import { test } from "../setup"

const SEEDED_MEDIA_ID = "4e26b80f-6661-4f5f-93b4-6dfed052bbed"
const TIMEOUT = 30_000
const countOutbox = async ({ db }: Services) => {
  const row = await db
    .selectFrom("searchOutbox")
    .select(db.fn.countAll<string>().as("count"))
    .executeTakeFirstOrThrow()

  return Number(row.count)
}
const touchMedias = async ({ db }: Services, ids: string[]) => {
  await db.updateTable("medias").set({ deletedAt: null }).where("id", "in", ids).execute()
}

describe("drainSearchOutbox", () => {
  test(
    "pushes the current state of an enqueued media",
    async ({ services }) => {
      await services.db
        .updateTable("titles")
        .set({ title: "Drained main title" })
        .where("mediaId", "=", SEEDED_MEDIA_ID)
        .where("isMainTitle", "=", true)
        .execute()

      expect(await drainSearchOutbox(services)).toEqual({ synced: 1, removed: 0 })
      expect(await countOutbox(services)).toBe(0)

      await waitForMediaDoc(
        services,
        SEEDED_MEDIA_ID,
        (doc) => doc?.mainTitle?.title === "Drained main title",
      )
    },
    TIMEOUT,
  )

  test(
    "removes the document of a deleted media",
    async ({ services }) => {
      await services.db
        .updateTable("medias")
        .set({ deletedAt: new Date() })
        .where("id", "=", SEEDED_MEDIA_ID)
        .execute()

      expect(await drainSearchOutbox(services)).toEqual({ synced: 0, removed: 1 })

      await waitForMediaDoc(services, SEEDED_MEDIA_ID, (doc) => doc === null)
    },
    TIMEOUT,
  )

  test("rebuilds a media once however many times it was enqueued", async ({ services }) => {
    await touchMedias(services, [SEEDED_MEDIA_ID])
    await touchMedias(services, [SEEDED_MEDIA_ID])
    await touchMedias(services, [SEEDED_MEDIA_ID])

    expect(await countOutbox(services)).toBe(3)
    expect(await drainSearchOutbox(services)).toEqual({ synced: 1, removed: 0 })
    expect(await countOutbox(services)).toBe(0)
  })

  test("stops at the limit and leaves the rest for the next drain", async ({ services }) => {
    const medias = await services.db
      .selectFrom("medias")
      .select("id")
      .where("deletedAt", "is", null)
      .limit(3)
      .execute()

    await touchMedias(
      services,
      medias.map((media) => media.id),
    )

    expect(await drainSearchOutbox(services, { limit: 2 })).toEqual({ synced: 2, removed: 0 })
    expect(await countOutbox(services)).toBe(1)
  })

  test("keeps the rows when Meilisearch rejects the push", async ({ services }) => {
    await touchMedias(services, [SEEDED_MEDIA_ID])

    await expect(
      drainSearchOutbox({ ...services, mediasIndex: "not a valid index uid!" }),
    ).rejects.toThrow(/not a valid index uid/)
    expect(await countOutbox(services)).toBe(1)
  })

  test(
    "a staff rename over HTTP reaches the documents crediting them",
    async ({ app, services }) => {
      const credit = await services.db
        .selectFrom("mediaStaffs")
        .select(["staffId", "mediaId"])
        .where("mediaId", "=", SEEDED_MEDIA_ID)
        .executeTakeFirstOrThrow()
      const { headers } = await signInAs(services, { role: "ADMIN" })
      const form = new FormData()

      form.append("name", "Renamed through the outbox")

      const res = await api(app, `/staffs/${credit.staffId}`, { method: "PATCH", headers, form })

      expect(res.status).toBe(200)

      await waitForMediaDoc(services, SEEDED_MEDIA_ID, (doc) =>
        Boolean(doc?.staffNames.includes("Renamed through the outbox")),
      )
    },
    TIMEOUT,
  )
})
