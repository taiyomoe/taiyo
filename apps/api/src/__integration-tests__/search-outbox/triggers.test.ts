import { describe, expect } from "vitest"
import type { Services } from "../../services"
import { defined } from "../helpers/assert"
import { signInAs } from "../helpers/auth"
import { test } from "../setup"

const SEEDED_MEDIA_ID = "4e26b80f-6661-4f5f-93b4-6dfed052bbed"
const resetOutbox = async ({ db }: Services) => {
  await db.deleteFrom("searchOutbox").execute()
}
const readOutbox = async ({ db }: Services) => {
  const rows = await db.selectFrom("searchOutbox").select("mediaId").orderBy("id").execute()

  return rows.map((row) => row.mediaId)
}
const getOtherMediaId = async ({ db }: Services) => {
  const row = await db
    .selectFrom("medias")
    .select("id")
    .where("id", "!=", SEEDED_MEDIA_ID)
    .executeTakeFirstOrThrow()

  return row.id
}

describe("search outbox triggers", () => {
  test("a media update enqueues the media", async ({ services }) => {
    await resetOutbox(services)
    await services.db
      .updateTable("medias")
      .set({ deletedAt: null })
      .where("id", "=", SEEDED_MEDIA_ID)
      .execute()

    expect(await readOutbox(services)).toEqual([SEEDED_MEDIA_ID])
  })

  test.for(["titles", "covers", "chapters"] as const)(
    "an update to %s enqueues the owning media",
    async (table, { services }) => {
      const row = await services.db
        .selectFrom(table)
        .select("id")
        .where("mediaId", "=", SEEDED_MEDIA_ID)
        .executeTakeFirstOrThrow()

      await resetOutbox(services)
      await services.db
        .updateTable(table)
        .set({ deletedAt: null })
        .where("id", "=", row.id)
        .execute()

      expect(await readOutbox(services)).toEqual([SEEDED_MEDIA_ID])
    },
  )

  test("moving a chapter to another media enqueues both medias", async ({ services }) => {
    const otherMediaId = await getOtherMediaId(services)
    const chapter = await services.db
      .selectFrom("chapters")
      .select("id")
      .where("mediaId", "=", SEEDED_MEDIA_ID)
      .executeTakeFirstOrThrow()

    await resetOutbox(services)
    await services.db
      .updateTable("chapters")
      .set({ mediaId: otherMediaId })
      .where("id", "=", chapter.id)
      .execute()

    expect(await readOutbox(services)).toEqual([SEEDED_MEDIA_ID, otherMediaId])
  })

  test("adding and removing a library entry enqueues the media each time", async ({ services }) => {
    const { userId } = await signInAs(services)

    await resetOutbox(services)
    await services.db
      .insertInto("userLibraryEntries")
      .values({ userId, mediaId: SEEDED_MEDIA_ID, status: "READING" })
      .execute()
    await services.db
      .deleteFrom("userLibraryEntries")
      .where("userId", "=", userId)
      .where("mediaId", "=", SEEDED_MEDIA_ID)
      .execute()

    expect(await readOutbox(services)).toEqual([SEEDED_MEDIA_ID, SEEDED_MEDIA_ID])
  })

  test("linking and unlinking a staff enqueues the media each time", async ({ services }) => {
    const otherMediaId = await getOtherMediaId(services)
    const credit = await services.db
      .selectFrom("mediaStaffs")
      .selectAll()
      .where("mediaId", "=", SEEDED_MEDIA_ID)
      .executeTakeFirstOrThrow()

    await resetOutbox(services)
    await services.db
      .insertInto("mediaStaffs")
      .values({ ...credit, mediaId: otherMediaId })
      .execute()
    await services.db
      .deleteFrom("mediaStaffs")
      .where("mediaId", "=", otherMediaId)
      .where("staffId", "=", credit.staffId)
      .where("role", "=", credit.role)
      .execute()

    expect(await readOutbox(services)).toEqual([otherMediaId, otherMediaId])
  })

  test.for([
    { action: "renaming", set: { name: "Renamed for the outbox" } },
    { action: "soft-deleting", set: { deletedAt: new Date() } },
  ])("$action a staff enqueues every media crediting them", async ({ set }, { services }) => {
    const credits = await services.db
      .selectFrom("mediaStaffs")
      .select(["staffId", "mediaId"])
      .execute()
    const staffId = defined(credits[0]).staffId
    const expected = credits
      .filter((credit) => credit.staffId === staffId)
      .map((credit) => credit.mediaId)
      .sort()

    await resetOutbox(services)
    await services.db.updateTable("staffs").set(set).where("id", "=", staffId).execute()

    expect((await readOutbox(services)).sort()).toEqual(expected)
  })

  test("writes to unrelated tables enqueue nothing", async ({ services }) => {
    await signInAs(services)
    await resetOutbox(services)
    await services.db.updateTable("users").set({ banned: false }).execute()

    expect(await readOutbox(services)).toEqual([])
  })

  test("a rolled-back write enqueues nothing", async ({ services }) => {
    await resetOutbox(services)
    await services.db
      .transaction()
      .execute(async (trx) => {
        await trx
          .updateTable("medias")
          .set({ deletedAt: null })
          .where("id", "=", SEEDED_MEDIA_ID)
          .execute()

        throw new Error("rollback")
      })
      .catch(() => {})

    expect(await readOutbox(services)).toEqual([])
  })
})
