import type { MangaDexSyncJobData, MangaDexSyncProducer } from "@taiyomoe/queue"
import { createMangaDexClient } from "@taiyomoe/mangadex"
import sharp from "sharp"

type FakeStaff = { id: string; role: "author" | "artist"; name: string; twitter?: string }

type FakeGroup = { id: string; name: string; discord?: string; website?: string }

export type FakeManga = {
  id: string
  title: Record<string, string>
  altTitles?: Array<Record<string, string>>
  description?: Record<string, string>
  links?: Record<string, string>
  originalLanguage?: string
  publicationDemographic?: string | null
  status?: string
  year?: number | null
  contentRating?: string
  tags?: string[]
  staff?: FakeStaff[]
}

export type FakeCover = { id: string; volume: string | null; locale: string }

export type FakeChapter = {
  id: string
  chapter: string | null
  translatedLanguage: string
  volume?: string | null
  title?: string | null
  pages?: number
  externalUrl?: string | null
  publishAt?: string
  groups?: FakeGroup[]
}

const page = await sharp({
  create: { width: 4, height: 6, channels: 3, background: { r: 30, g: 90, b: 160 } },
})
  .png()
  .toBuffer()
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } })
const notFound = () => json({ result: "error", errors: [{ status: 404 }] }, 404)
const collection = (items: unknown[], url: URL) => {
  const limit = Number(url.searchParams.get("limit") ?? 10)
  const offset = Number(url.searchParams.get("offset") ?? 0)

  return json({
    result: "ok",
    data: items.slice(offset, offset + limit),
    limit,
    offset,
    total: items.length,
  })
}

/**
 * A MangaDex stand-in behind the real client: tests fill `mangas`, `covers` and `chapters` with
 * MangaDex-shaped data, and every image URL serves a small PNG unless listed in `brokenImages`.
 * A chapter in `flakyNodes` first gets a MangaDex@Home node that answers nothing but errors.
 * Started syncs land in `jobs` instead of a queue.
 */
export const createFakeMangaDex = () => {
  const mangas = new Map<string, FakeManga>()
  const covers = new Map<string, FakeCover[]>()
  const chapters = new Map<string, FakeChapter[]>()
  const brokenImages = new Set<string>()
  const flakyNodes = new Set<string>()
  const pageSources = new Map<string, number>()
  const requests: string[] = []
  const jobs: MangaDexSyncJobData[] = []
  const toCover = (mangaId: string, cover: FakeCover) => ({
    id: cover.id,
    type: "cover_art",
    attributes: { volume: cover.volume, fileName: `${cover.id}.jpg`, locale: cover.locale },
    relationships: [{ id: mangaId, type: "manga" }],
  })
  const toChapter = (chapter: FakeChapter) => ({
    id: chapter.id,
    type: "chapter",
    attributes: {
      chapter: chapter.chapter,
      volume: chapter.volume ?? null,
      title: chapter.title ?? null,
      translatedLanguage: chapter.translatedLanguage,
      externalUrl: chapter.externalUrl ?? null,
      isUnavailable: false,
      publishAt: chapter.publishAt ?? "2024-05-01T10:00:00+00:00",
      readableAt: chapter.publishAt ?? "2024-05-01T10:00:00+00:00",
      pages: chapter.pages ?? 2,
    },
    relationships: (chapter.groups ?? []).map((group) => ({
      id: group.id,
      type: "scanlation_group",
      attributes: {
        name: group.name,
        website: group.website ?? null,
        discord: group.discord ?? null,
        contactEmail: null,
        twitter: null,
        description: null,
      },
    })),
  })
  const respond = (input: string) => {
    const url = new URL(input)

    requests.push(url.pathname)

    if (url.hostname === "flaky.mangadex.network") {
      return new Response("unavailable", { status: 503 })
    }

    if (url.hostname !== "api.mangadex.org") {
      return brokenImages.has(input)
        ? new Response("gone", { status: 404 })
        : new Response(new Uint8Array(page), { headers: { "Content-Type": "image/png" } })
    }

    const parts = url.pathname.split("/").filter(Boolean)

    if (parts[0] === "manga" && parts.length === 2) {
      const manga = mangas.get(parts[1] ?? "")

      if (manga === undefined) {
        return notFound()
      }

      return json({
        result: "ok",
        data: {
          id: manga.id,
          type: "manga",
          attributes: {
            title: manga.title,
            altTitles: manga.altTitles ?? [],
            description: manga.description ?? [],
            links: manga.links ?? null,
            originalLanguage: manga.originalLanguage ?? "ja",
            publicationDemographic: manga.publicationDemographic ?? null,
            status: manga.status ?? "ongoing",
            year: manga.year ?? null,
            contentRating: manga.contentRating ?? "safe",
            tags: (manga.tags ?? []).map((name, index) => ({
              id: `tag-${index}`,
              type: "tag",
              attributes: { name: { en: name }, group: "genre" },
            })),
          },
          relationships: (manga.staff ?? []).map((member) => ({
            id: member.id,
            type: member.role,
            attributes: { name: member.name, biography: [], twitter: member.twitter ?? null },
          })),
        },
      })
    }

    if (parts[0] === "manga" && parts[2] === "feed") {
      const languages = url.searchParams.getAll("translatedLanguage[]")

      return collection(
        (chapters.get(parts[1] ?? "") ?? [])
          .filter((chapter) => languages.includes(chapter.translatedLanguage))
          .map(toChapter),
        url,
      )
    }

    if (parts[0] === "cover") {
      const mangaId = url.searchParams.get("manga[]")
      const ids = url.searchParams.getAll("ids[]")
      const all = [...covers.entries()].flatMap(([id, list]) =>
        list.map((cover) => toCover(id, cover)),
      )

      return collection(
        mangaId === null
          ? all.filter((cover) => ids.includes(cover.id))
          : all.filter((cover) => cover.relationships[0]?.id === mangaId),
        url,
      )
    }

    if (parts[0] === "chapter") {
      const ids = url.searchParams.getAll("ids[]")

      return collection(
        [...chapters.values()]
          .flat()
          .filter((chapter) => ids.includes(chapter.id))
          .map(toChapter),
        url,
      )
    }

    if (parts[0] === "at-home") {
      const chapterId = parts[2] ?? ""
      const chapter = [...chapters.values()].flat().find((candidate) => candidate.id === chapterId)
      const served = pageSources.get(chapterId) ?? 0

      pageSources.set(chapterId, served + 1)

      return chapter === undefined
        ? notFound()
        : json({
            result: "ok",
            baseUrl:
              flakyNodes.has(chapterId) && served === 0
                ? "https://flaky.mangadex.network"
                : "https://uploads.mangadex.org",
            chapter: {
              hash: "hash",
              data: Array.from({ length: chapter.pages ?? 2 }, (_, i) => `${i + 1}.png`),
            },
          })
    }

    return notFound()
  }

  return {
    client: createMangaDexClient({
      fetch: (input) => Promise.resolve(respond(input)),
      sleep: () => Promise.resolve(),
    }),
    queue: {
      enqueue: (job) => {
        jobs.push(job)

        return Promise.resolve()
      },
    } satisfies MangaDexSyncProducer,
    jobs,
    mangas,
    covers,
    chapters,
    brokenImages,
    flakyNodes,
    requests,
  }
}

export type FakeMangaDex = ReturnType<typeof createFakeMangaDex>
