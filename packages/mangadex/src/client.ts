import type { z } from "zod"
import { config } from "@taiyomoe/config"
import {
  atHomeResponseSchema,
  chaptersResponseSchema,
  coversResponseSchema,
  groupAttributesSchema,
  mangaResponseSchema,
  staffAttributesSchema,
} from "./schemas"

export class MangaDexNotFoundError extends Error {
  override name = "MangaDexNotFoundError"
}

class MangaDexUnavailableError extends Error {
  override name = "MangaDexUnavailableError"
}

export class MangaDexDownloadTooLargeError extends Error {
  override name = "MangaDexDownloadTooLargeError"
}

type Localized = Record<string, string>

export type MangaDexStaff = z.infer<typeof staffAttributesSchema> & {
  id: string
  role: "AUTHOR" | "ARTIST"
  biography: Localized
}

type MangaDexManga = {
  id: string
  title: Localized
  altTitles: Array<{ language: string; title: string }>
  description: Localized
  links: Localized
  originalLanguage: string
  demographic: string | null
  status: string
  year: number | null
  contentRating: string
  tags: Array<{ id: string; name: string; group: string }>
  staff: MangaDexStaff[]
}

export type MangaDexCover = {
  id: string
  volume: string | null
  locale: string | null
  fileName: string
  url: string
}

export type MangaDexGroup = z.infer<typeof groupAttributesSchema> & { id: string }

export type MangaDexChapter = {
  id: string
  chapter: string | null
  volume: string | null
  title: string | null
  language: string
  externalUrl: string | null
  isUnavailable: boolean
  pages: number
  publishedAt: string
  groups: MangaDexGroup[]
}

type MangaDexPageSource = { urls: string[]; reportsTo: string | null }

type Fetch = (input: string, init?: RequestInit) => Promise<Response>

const ALL_CONTENT_RATINGS = ["safe", "suggestive", "erotica", "pornographic"]
const defaultSleep = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms)
  })
const compact = (localized: Record<string, string | null> | null): Localized =>
  Object.fromEntries(
    Object.entries(localized ?? {}).flatMap(([key, value]) =>
      value === null || value.trim() === "" ? [] : [[key, value.trim()] as const],
    ),
  )
const toCover = (mangaId: string, cover: z.infer<typeof coversResponseSchema>["data"][number]) =>
  ({
    id: cover.id,
    volume:
      cover.attributes.volume === null || cover.attributes.volume.trim() === ""
        ? null
        : cover.attributes.volume.trim(),
    locale: cover.attributes.locale,
    fileName: cover.attributes.fileName,
    url: `${config.mangaDex.uploadsUrl}/covers/${mangaId}/${cover.attributes.fileName}`,
  }) satisfies MangaDexCover
const toChapter = (chapter: z.infer<typeof chaptersResponseSchema>["data"][number]) =>
  ({
    id: chapter.id,
    chapter: chapter.attributes.chapter,
    volume:
      chapter.attributes.volume === null || chapter.attributes.volume.trim() === ""
        ? null
        : chapter.attributes.volume.trim(),
    title:
      chapter.attributes.title === null || chapter.attributes.title.trim() === ""
        ? null
        : chapter.attributes.title.trim(),
    language: chapter.attributes.translatedLanguage,
    externalUrl: chapter.attributes.externalUrl,
    isUnavailable: chapter.attributes.isUnavailable ?? false,
    pages: chapter.attributes.pages,
    publishedAt: chapter.attributes.readableAt ?? chapter.attributes.publishAt,
    groups: chapter.relationships.flatMap((relationship) => {
      if (relationship.type !== "scanlation_group") {
        return []
      }

      const parsed = groupAttributesSchema.safeParse(relationship.attributes)

      return parsed.success ? [{ ...parsed.data, id: relationship.id }] : []
    }),
  }) satisfies MangaDexChapter
const readCapped = async (response: Response, maxBytes: number) => {
  const declared = Number(response.headers.get("Content-Length") ?? "")

  if (Number.isFinite(declared) && declared > maxBytes) {
    await response.body?.cancel()
    throw new MangaDexDownloadTooLargeError(`${declared} bytes is over the ${maxBytes} byte limit`)
  }

  const chunks: Uint8Array[] = []
  let total = 0

  if (response.body !== null) {
    const reader: ReadableStreamDefaultReader<Uint8Array> = response.body.getReader()

    for (let read = await reader.read(); !read.done; read = await reader.read()) {
      total += read.value.byteLength

      if (total > maxBytes) {
        await reader.cancel()
        throw new MangaDexDownloadTooLargeError(`The body is over the ${maxBytes} byte limit`)
      }

      chunks.push(read.value)
    }
  }

  return Buffer.concat(chunks, total)
}

export const createMangaDexClient = ({
  fetch = globalThis.fetch,
  sleep = defaultSleep,
}: { fetch?: Fetch; sleep?: (ms: number) => Promise<void> } = {}) => {
  const throttle = (intervalMs: number) => {
    let next = 0

    return async () => {
      const now = Date.now()
      const wait = Math.max(0, next - now)

      next = Math.max(now, next) + intervalMs

      if (wait > 0) {
        await sleep(wait)
      }
    }
  }
  const apiSlot = throttle(config.mangaDex.requestIntervalMs)
  const atHomeSlot = throttle(config.mangaDex.atHomeIntervalMs)
  const headers = { "User-Agent": config.mangaDex.userAgent }
  const backoff = (attempt: number) => sleep(2 ** attempt * 500)
  const request = async <T extends z.ZodType>(
    path: string,
    params: Array<[string, string]>,
    schema: T,
    slot = apiSlot,
  ): Promise<z.infer<T>> => {
    const url = new URL(path, config.mangaDex.apiUrl)

    for (const [key, value] of params) {
      url.searchParams.append(key, value)
    }

    let failure = "no response"

    for (let attempt = 1; attempt <= config.mangaDex.maxAttempts; attempt++) {
      await slot()

      let response: Response

      try {
        response = await fetch(url.toString(), { headers, signal: AbortSignal.timeout(30_000) })
      } catch (error) {
        failure = error instanceof Error ? error.message : String(error)
        await backoff(attempt)

        continue
      }

      if (response.status === 404) {
        throw new MangaDexNotFoundError(`MangaDex has nothing at ${url.pathname}`)
      }

      if (response.status === 429 || response.status >= 500) {
        failure = `MangaDex answered ${response.status}`

        const retryAt = Number(response.headers.get("X-RateLimit-Retry-After"))

        await (Number.isFinite(retryAt) && retryAt > 0
          ? sleep(Math.min(Math.max(retryAt * 1000 - Date.now(), 0), 60_000))
          : backoff(attempt))

        continue
      }

      if (!response.ok) {
        throw new MangaDexUnavailableError(`MangaDex answered ${response.status}`)
      }

      return schema.parse(await response.json())
    }

    throw new MangaDexUnavailableError(failure)
  }
  const paginate = async <T>(
    load: (offset: number) => Promise<{ data: T[]; total: number; limit: number }>,
  ) => {
    const items: T[] = []

    for (let offset = 0; ;) {
      const page = await load(offset)

      items.push(...page.data)
      offset += page.limit

      if (page.data.length === 0 || offset >= page.total) {
        return items
      }
    }
  }
  const chunk = <T>(values: readonly T[], size: number) =>
    Array.from({ length: Math.ceil(values.length / size) }, (_, index) =>
      values.slice(index * size, index * size + size),
    )
  const ratings = ALL_CONTENT_RATINGS.map(
    (rating) => ["contentRating[]", rating] as [string, string],
  )

  return {
    getManga: async (id: string) => {
      const { data } = await request(
        `/manga/${id}`,
        [
          ["includes[]", "author"],
          ["includes[]", "artist"],
        ],
        mangaResponseSchema,
      )
      const { attributes } = data

      return {
        id: data.id,
        title: compact(attributes.title),
        altTitles: (attributes.altTitles ?? []).flatMap((entry) =>
          Object.entries(compact(entry)).map(([language, title]) => ({ language, title })),
        ),
        description: compact(attributes.description),
        links: compact(attributes.links),
        originalLanguage: attributes.originalLanguage,
        demographic: attributes.publicationDemographic,
        status: attributes.status,
        year: attributes.year,
        contentRating: attributes.contentRating,
        tags: attributes.tags.map((tag) => ({
          id: tag.id,
          name: compact(tag.attributes.name).en ?? "",
          group: tag.attributes.group,
        })),
        staff: data.relationships.flatMap((relationship) => {
          if (relationship.type !== "author" && relationship.type !== "artist") {
            return []
          }

          const parsed = staffAttributesSchema.safeParse(relationship.attributes)

          return parsed.success
            ? [
                {
                  ...parsed.data,
                  id: relationship.id,
                  role: relationship.type === "author" ? ("AUTHOR" as const) : ("ARTIST" as const),
                  biography: compact(parsed.data.biography),
                },
              ]
            : []
        }),
      } satisfies MangaDexManga
    },
    listCovers: async (mangaId: string) =>
      (
        await paginate((offset) =>
          request(
            "/cover",
            [
              ["manga[]", mangaId],
              ["order[volume]", "asc"],
              ["limit", String(config.mangaDex.pageSize)],
              ["offset", String(offset)],
            ],
            coversResponseSchema,
          ),
        )
      ).map((cover) => toCover(mangaId, cover)),
    getCovers: async (mangaId: string, ids: readonly string[]) => {
      const covers = []

      for (const batch of chunk(ids, config.mangaDex.pageSize)) {
        const page = await request(
          "/cover",
          [
            ...batch.map((id) => ["ids[]", id] as [string, string]),
            ["limit", String(config.mangaDex.pageSize)],
          ],
          coversResponseSchema,
        )

        covers.push(...page.data.map((cover) => toCover(mangaId, cover)))
      }

      return covers
    },
    listChapters: async (mangaId: string, languages: readonly string[]) =>
      (
        await paginate((offset) =>
          request(
            `/manga/${mangaId}/feed`,
            [
              ...languages.map(
                (language) => ["translatedLanguage[]", language] as [string, string],
              ),
              ...ratings,
              ["includes[]", "scanlation_group"],
              ["order[volume]", "asc"],
              ["order[chapter]", "asc"],
              ["limit", String(config.mangaDex.feedPageSize)],
              ["offset", String(offset)],
            ],
            chaptersResponseSchema,
          ),
        )
      ).map(toChapter),
    getChapters: async (ids: readonly string[]) => {
      const chapters = []

      for (const batch of chunk(ids, config.mangaDex.pageSize)) {
        const page = await request(
          "/chapter",
          [
            ...batch.map((id) => ["ids[]", id] as [string, string]),
            ...ratings,
            ["includes[]", "scanlation_group"],
            ["limit", String(config.mangaDex.pageSize)],
          ],
          chaptersResponseSchema,
        )

        chapters.push(...page.data.map(toChapter))
      }

      return chapters
    },
    getPageSource: async (chapterId: string) => {
      const { baseUrl, chapter } = await request(
        `/at-home/server/${chapterId}`,
        [],
        atHomeResponseSchema,
        atHomeSlot,
      )

      return {
        urls: chapter.data.map((file) => `${baseUrl}/data/${chapter.hash}/${file}`),
        // Images served by MangaDex@Home nodes must be reported back, mangadex.org ones not.
        reportsTo: new URL(baseUrl).hostname.endsWith("mangadex.org")
          ? null
          : config.mangaDex.networkReportUrl,
      } satisfies MangaDexPageSource
    },
    download: async (
      url: string,
      {
        reportsTo = null,
        maxBytes = config.mangaDex.maxDownloadBytes,
      }: { reportsTo?: string | null; maxBytes?: number } = {},
    ) => {
      let failure = "no response"

      for (let attempt = 1; attempt <= 3; attempt++) {
        const startedAt = Date.now()
        let bytes: Buffer | null = null
        let cached = false

        try {
          const response = await fetch(url, { headers, signal: AbortSignal.timeout(60_000) })

          cached = response.headers.get("X-Cache")?.startsWith("HIT") ?? false

          if (response.ok) {
            bytes = await readCapped(response, maxBytes)
          } else {
            failure = `${new URL(url).hostname} answered ${response.status}`
          }
        } catch (error) {
          if (error instanceof MangaDexDownloadTooLargeError) {
            throw error
          }

          const cause =
            error instanceof Error && error.cause instanceof Error
              ? ` (${"code" in error.cause ? String(error.cause.code) : error.cause.message})`
              : ""

          failure = `${new URL(url).hostname}: ${error instanceof Error ? error.message : String(error)}${cause}`
        }

        if (reportsTo !== null) {
          void fetch(reportsTo, {
            method: "POST",
            headers: { ...headers, "Content-Type": "application/json" },
            body: JSON.stringify({
              url,
              success: bytes !== null,
              bytes: bytes?.byteLength ?? 0,
              duration: Date.now() - startedAt,
              cached,
            }),
          }).catch(() => {})
        }

        if (bytes !== null) {
          return bytes
        }

        await backoff(attempt)
      }

      throw new MangaDexUnavailableError(failure)
    },
  }
}

export type MangaDexClient = ReturnType<typeof createMangaDexClient>
