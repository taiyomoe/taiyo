import { api } from "@/lib/api"

const SHELL_CACHE = "taiyo-shell-v1"
const OFFLINE_CACHE = "taiyo-offline-v1"
const MANIFEST_PATH = "/__offline/manifest.json"
const IMAGE_CONCURRENCY = 4
const SHELL_INITIATORS = new Set(["script", "link", "css", "other"])

export type OfflineChapter = {
  id: string
  mediaId: string
  mediaTitle: string
  label: string
  pageCount: number
  downloadedAt: string
  urls: string[]
}

export type OfflineChapterSource = {
  id: string
  mediaId: string
  mediaTitle: string
  label: string
  pageUrls: readonly string[]
  contentRatings: readonly string[]
}

export const isOfflineSupported = () =>
  typeof window !== "undefined" && "serviceWorker" in navigator && "caches" in window

export const registerOfflineWorker = async () => {
  await navigator.serviceWorker.register("/sw.js", { scope: "/" })
  await navigator.serviceWorker.ready
}

const manifestUrl = () => new URL(MANIFEST_PATH, window.location.origin).href

export const readOfflineChapters = async () => {
  const cache = await caches.open(OFFLINE_CACHE)
  const response = await cache.match(manifestUrl())

  if (response === undefined) {
    return []
  }

  const parsed: unknown = await response.json()

  return Array.isArray(parsed) ? parsed.filter(isOfflineChapter) : []
}

const isOfflineChapter = (value: unknown): value is OfflineChapter =>
  typeof value === "object" &&
  value !== null &&
  "id" in value &&
  typeof value.id === "string" &&
  "urls" in value &&
  Array.isArray(value.urls)
const writeOfflineChapters = async (chapters: readonly OfflineChapter[]) => {
  const cache = await caches.open(OFFLINE_CACHE)

  await cache.put(
    manifestUrl(),
    new Response(JSON.stringify(chapters), { headers: { "content-type": "application/json" } }),
  )
}
const cacheAppShell = async () => {
  const cache = await caches.open(SHELL_CACHE)
  const urls = performance
    .getEntriesByType("resource")
    .filter(
      (entry): entry is PerformanceResourceTiming =>
        entry instanceof PerformanceResourceTiming &&
        SHELL_INITIATORS.has(entry.initiatorType) &&
        new URL(entry.name).origin === window.location.origin,
    )
    .map((entry) => entry.name)

  await Promise.all(urls.map((url) => cache.add(url).catch(() => {})))
}
const fetchImage = async (url: string, cors: boolean, signal: AbortSignal) =>
  fetch(url, { mode: cors ? "cors" : "no-cors", signal })
const deleteUnshared = async (urls: readonly string[], kept: readonly OfflineChapter[]) => {
  const shared = new Set(kept.flatMap((entry) => entry.urls))
  const cache = await caches.open(OFFLINE_CACHE)

  await Promise.all(urls.filter((url) => !shared.has(url)).map((url) => cache.delete(url)))
}

export const downloadOfflineChapter = async (
  source: OfflineChapterSource,
  options: { signal: AbortSignal; onProgress: (done: number) => void },
) => {
  try {
    return await saveOfflineChapter(source, options)
  } catch (error) {
    const kept = (await readOfflineChapters()).filter((entry) => entry.id !== source.id)
    const documentUrl = new URL(`/chapters/${source.id}`, window.location.origin).href

    await deleteUnshared([documentUrl, ...source.pageUrls], kept)

    throw error
  }
}

const saveOfflineChapter = async (
  source: OfflineChapterSource,
  { signal, onProgress }: { signal: AbortSignal; onProgress: (done: number) => void },
) => {
  await registerOfflineWorker()
  await navigator.storage.persist().catch(() => false)

  const cache = await caches.open(OFFLINE_CACHE)
  const contentRating = source.contentRatings.join(",")
  const documentUrl = new URL(`/chapters/${source.id}`, window.location.origin).href
  const dataUrls = [
    api.chapters[":id"].$url({ param: { id: source.id } }).href,
    api.chapters[":id"].reader.$url({ param: { id: source.id }, query: { contentRating } }).href,
    api.medias[":id"].$url({ param: { id: source.mediaId } }).href,
  ]

  for (const url of [...dataUrls, documentUrl]) {
    const response = await fetch(url, { credentials: "include", signal })

    if (!response.ok) {
      throw new Error(`Couldn't save ${url} (${response.status})`)
    }

    await cache.put(url, response)
  }

  await cacheAppShell()

  const [firstUrl] = source.pageUrls
  const cors =
    firstUrl !== undefined &&
    (await fetchImage(firstUrl, true, signal).then(
      async (response) => {
        await cache.put(firstUrl, response)

        return true
      },
      () => false,
    ))
  const queue = source.pageUrls.slice(cors ? 1 : 0)
  let done = cors ? 1 : 0

  onProgress(done)

  const worker = async () => {
    for (let url = queue.shift(); url !== undefined; url = queue.shift()) {
      await cache.put(url, await fetchImage(url, cors, signal))
      done += 1
      onProgress(done)
    }
  }

  await Promise.all(Array.from({ length: IMAGE_CONCURRENCY }, worker))

  const chapter = {
    id: source.id,
    mediaId: source.mediaId,
    mediaTitle: source.mediaTitle,
    label: source.label,
    pageCount: source.pageUrls.length,
    downloadedAt: new Date().toISOString(),
    urls: [...dataUrls, documentUrl, ...source.pageUrls],
  } satisfies OfflineChapter
  const others = (await readOfflineChapters()).filter((entry) => entry.id !== source.id)
  const next = [chapter, ...others]

  await writeOfflineChapters(next)

  return next
}

// The saved responses carry the account that downloaded them: the next person on this browser
// must not read them, nor be served them by the service worker.
export const deleteOfflineChapters = () => caches.delete(OFFLINE_CACHE)

export const removeOfflineChapter = async (chapterId: string) => {
  const chapters = await readOfflineChapters()
  const kept = chapters.filter((entry) => entry.id !== chapterId)

  await deleteUnshared(chapters.find((entry) => entry.id === chapterId)?.urls ?? [], kept)
  await writeOfflineChapters(kept)

  return kept
}
