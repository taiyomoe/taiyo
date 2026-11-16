import { describe, expect } from "vitest"
import type { MangaDexPlan } from "../../utils/mangadex-sync"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { seedChapter, seedGroup, seedMedia, seedStaff, seedTitle } from "../helpers/seed"
import { test } from "../setup"

const MANGADEX_ID = "b0b721ff-c388-4486-aa0f-c2b0bb321512"

describe("GET /medias/:id/mangadex-sync", () => {
  test("lists only what Taiyō is missing", async ({ app, services, mangaDex }) => {
    const { headers, userId } = await signInAs(services, { role: "UPLOADER" })
    const mediaId = await seedMedia(services, userId)
    const groupId = await seedGroup(services, userId, "Blue Solo")
    const staffId = await seedStaff(services, userId, "Yamada Kanehito")

    await services.db
      .updateTable("medias")
      .set({ links: { mangaDex: MANGADEX_ID, anilist: 118586 }, synopsis: { en: "Already here." } })
      .where("id", "=", mediaId)
      .execute()
    await seedTitle(services, {
      mediaId,
      creatorId: userId,
      title: "Sousou no Frieren",
      language: "ja_ro",
      isMainTitle: true,
    })
    await services.db
      .insertInto("covers")
      .values({ mediaId, language: "ja", volume: "1", uploaderId: userId })
      .execute()
    await seedChapter(services, {
      mediaId,
      uploaderId: userId,
      number: 1,
      language: "fr",
      groupIds: [groupId],
      status: "PUBLISHED",
    })

    mangaDex.mangas.set(MANGADEX_ID, {
      id: MANGADEX_ID,
      title: { "ja-ro": "Sousou no Frieren" },
      altTitles: [
        { en: "Frieren: Beyond Journey's End" },
        { ru: "Фрирен" },
        { "ja-ro": "sousou no frieren" },
      ],
      description: { en: "Elf mage.", fr: "Une elfe.\n\n---\n**Links:** somewhere" },
      links: { al: "118586", mal: "126287", mu: "ugf5dzu", engtl: "https://www.viz.com/frieren" },
      year: 2020,
      status: "hiatus",
      tags: ["Adventure", "Fantasy", "Not A Taiyō Tag"],
      staff: [
        { id: "11111111-1111-4111-8111-111111111111", role: "author", name: "Yamada Kanehito" },
        { id: "22222222-2222-4222-8222-222222222222", role: "artist", name: "Abe Tsukasa" },
      ],
    })
    mangaDex.covers.set(MANGADEX_ID, [
      { id: "c0000000-0000-4000-8000-000000000001", volume: "1", locale: "ja" },
      { id: "c0000000-0000-4000-8000-000000000002", volume: "2", locale: "ja" },
      { id: "c0000000-0000-4000-8000-000000000003", volume: "2", locale: "ja" },
      { id: "c0000000-0000-4000-8000-000000000004", volume: "1", locale: "es" },
    ])
    mangaDex.chapters.set(MANGADEX_ID, [
      {
        id: "d0000000-0000-4000-8000-000000000001",
        chapter: "1",
        translatedLanguage: "fr",
        groups: [{ id: "g1", name: "blue solo" }],
      },
      {
        id: "d0000000-0000-4000-8000-000000000002",
        chapter: "1",
        translatedLanguage: "pt-br",
        groups: [{ id: "g2", name: "Lua Scans" }],
      },
      {
        id: "d0000000-0000-4000-8000-000000000003",
        chapter: "2.5",
        translatedLanguage: "pt",
        volume: "1",
      },
      { id: "d0000000-0000-4000-8000-000000000004", chapter: "Extra", translatedLanguage: "en" },
      {
        id: "d0000000-0000-4000-8000-000000000005",
        chapter: "3",
        translatedLanguage: "en",
        pages: 0,
        externalUrl: "https://mangaplus.shueisha.co.jp/viewer/1",
      },
      {
        id: "d0000000-0000-4000-8000-000000000006",
        chapter: "4",
        translatedLanguage: "en",
        publishAt: "2999-01-01T00:00:00+00:00",
      },
      {
        id: "d0000000-0000-4000-8000-000000000007",
        chapter: null,
        translatedLanguage: "en",
        volume: "3",
      },
      {
        id: "d0000000-0000-4000-8000-000000000008",
        chapter: "1",
        translatedLanguage: "pt-br",
        volume: "2",
        groups: [{ id: "g2", name: "Lua Scans" }],
      },
      {
        id: "d0000000-0000-4000-8000-000000000009",
        chapter: "1",
        translatedLanguage: "pt-br",
        groups: [{ id: "g3", name: "Sol Scans" }],
      },
    ])

    const res = await api<MangaDexPlan>(app, `/medias/${mediaId}/mangadex-sync`, { headers })

    expect(res.status).toBe(200)

    if (!res.body.success) {
      throw new Error(JSON.stringify(res.body))
    }

    const plan = res.body.data

    expect(plan.titles.map((title) => [title.language, title.title])).toEqual([
      ["en", "Frieren: Beyond Journey's End"],
    ])
    expect(plan.synopses).toEqual([
      { key: "synopsis:fr", language: "fr", text: "Une elfe.", selected: true },
    ])
    expect(plan.staff.map((member) => [member.name, member.role, member.staffId])).toEqual([
      ["Yamada Kanehito", "AUTHOR", staffId],
      ["Abe Tsukasa", "ARTIST", null],
    ])
    expect(plan.tags.map((tag) => tag.tag)).toEqual(["ADVENTURE", "FANTASY"])
    expect(plan.unmatchedTags).toEqual(["Not A Taiyō Tag"])
    expect(Object.fromEntries(plan.links.map((link) => [link.link, link.value]))).toEqual({
      myAnimeList: 126287,
      mangaUpdates: "https://www.mangaupdates.com/series/ugf5dzu",
      officialENTranslation: "https://www.viz.com/frieren",
    })
    expect(plan.fields).toEqual([
      expect.objectContaining({
        field: "status",
        current: "RELEASING",
        proposed: "HIATUS",
        selected: false,
      }),
      expect.objectContaining({
        field: "startDate",
        proposed: "2020-01-01T00:00:00.000Z",
        selected: true,
      }),
    ])
    expect(plan.covers.map((cover) => [cover.mangaDexId, cover.fileName])).toEqual([
      ["c0000000-0000-4000-8000-000000000002", "c0000000-0000-4000-8000-000000000002.jpg"],
    ])
    expect(
      plan.chapters.map((chapter) => [chapter.language, chapter.number, chapter.isExternal]),
    ).toEqual([
      ["en", 3, true],
      ["pt_br", 1, false],
      ["pt_br", 1, false],
      ["pt_pt", 2.5, false],
    ])
    expect(plan.chapters.slice(1, 3).map((chapter) => chapter.groups)).toEqual([
      [{ name: "Lua Scans", exists: false }],
      [{ name: "Sol Scans", exists: false }],
    ])
    expect(plan.skippedChapters).toBe(4)
  }, 30_000)

  test("needs a MangaDex ID for a media without a link", async ({ app, services, mangaDex }) => {
    const { headers, userId } = await signInAs(services, { role: "ADMIN" })
    const mediaId = await seedMedia(services, userId)
    const missing = await api(app, `/medias/${mediaId}/mangadex-sync`, { headers })

    expect(missing.status).toBe(422)
    expect(missing.body).toMatchObject({ code: "MANGADEX_NOT_LINKED" })

    const unknown = await api(app, `/medias/${mediaId}/mangadex-sync?mangaDexId=${MANGADEX_ID}`, {
      headers,
    })

    expect(unknown.status).toBe(404)
    expect(unknown.body).toMatchObject({ code: "MANGADEX_NOT_FOUND" })

    mangaDex.mangas.set(MANGADEX_ID, { id: MANGADEX_ID, title: { en: "Frieren" } })

    const found = await api(app, `/medias/${mediaId}/mangadex-sync?mangaDexId=${MANGADEX_ID}`, {
      headers,
    })

    expect(found.status).toBe(200)
  }, 30_000)

  test("refuses a MangaDex ID another media is linked to", async ({ app, services, mangaDex }) => {
    const { headers, userId } = await signInAs(services, { role: "ADMIN" })
    const [mediaId, otherId] = [
      await seedMedia(services, userId),
      await seedMedia(services, userId),
    ]

    await services.db
      .updateTable("medias")
      .set({ links: { mangaDex: MANGADEX_ID } })
      .where("id", "=", otherId)
      .execute()
    mangaDex.mangas.set(MANGADEX_ID, { id: MANGADEX_ID, title: { en: "Frieren" } })

    const conflict = await api(app, `/medias/${mediaId}/mangadex-sync?mangaDexId=${MANGADEX_ID}`, {
      headers,
    })
    const mismatch = await api(
      app,
      `/medias/${otherId}/mangadex-sync?mangaDexId=7e544761-7d3d-4fce-8137-719814d7d138`,
      { headers },
    )

    expect(conflict.status).toBe(409)
    expect(conflict.body).toMatchObject({ code: "MEDIA_LINK_CONFLICT" })
    expect(mismatch.status).toBe(409)
    expect(mismatch.body).toMatchObject({ code: "MANGADEX_LINK_MISMATCH" })
  }, 30_000)

  test("previews a MangaDex cover through Taiyō", async ({ app, services, mangaDex }) => {
    const { headers } = await signInAs(services, { role: "UPLOADER" })
    const path = `/mangadex-syncs/covers/${MANGADEX_ID}/c0000000-0000-4000-8000-000000000002.jpg`
    const preview = await app.request(path, { headers })

    expect(preview.status).toBe(200)
    expect(preview.headers.get("Content-Type")).toBe("image/jpeg")
    expect(mangaDex.requests).toContain(
      `/covers/${MANGADEX_ID}/c0000000-0000-4000-8000-000000000002.jpg.256.jpg`,
    )

    const invalid = await app.request(`/mangadex-syncs/covers/${MANGADEX_ID}/..%2Fsecret`, {
      headers,
    })

    expect(invalid.status).toBe(422)

    mangaDex.brokenImages.add(
      `https://uploads.mangadex.org${path.replace("/mangadex-syncs", "")}.256.jpg`,
    )

    const broken = await app.request(path, { headers })

    expect(broken.status).toBe(502)

    const user = await signInAs(services, { role: "USER" })
    const forbidden = await app.request(path, { headers: user.headers })

    expect(forbidden.status).toBe(403)
  }, 30_000)

  test("is limited to uploaders and admins", async ({ app, services }) => {
    const anonymous = await api(app, "/medias/4e26b80f-6661-4f5f-93b4-6dfed052bbed/mangadex-sync")

    expect(anonymous.status).toBe(401)

    for (const role of ["USER", "UPLOADER_INTERN", "MODERATOR"] as const) {
      const { headers } = await signInAs(services, { role })
      const res = await api(app, "/medias/4e26b80f-6661-4f5f-93b4-6dfed052bbed/mangadex-sync", {
        headers,
      })

      expect({ role, status: res.status }).toEqual({ role, status: 403 })
    }
  }, 30_000)
})
