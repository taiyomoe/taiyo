import type { ImageMimeType, Language } from "@taiyomoe/db/constants"
import { api } from "@/lib/api"
import { ensureSuccess, unwrap } from "@/lib/envelope"

export type ChapterDraft = {
  mediaId: string
  number: number
  volume: string | null
  title: string | null
  language: Language
  groupIds: string[]
  publishAt: string | null
  externalUrl: string | null
  isExternal: boolean
}

export type UploadPage = { blob: Blob; type: ImageMimeType }

const PARALLEL_UPLOADS = 4

export const createChapter = async (
  { mediaId, groupIds, ...details }: ChapterDraft,
  signal: AbortSignal,
) => {
  const response = await api.medias[":id"].chapters.$post(
    { param: { id: mediaId }, json: { ...details, groupIds } },
    { init: { signal } },
  )

  return unwrap<Awaited<ReturnType<typeof response.json>>>(response)
}

export const uploadPages = async (
  chapterId: string,
  pages: UploadPage[],
  onProgress: (done: number) => void,
  signal: AbortSignal,
) => {
  const sessionResponse = await api.chapters[":id"].pages["upload-session"].$post(
    {
      param: { id: chapterId },
      json: { pages: pages.map((page) => ({ contentType: page.type, size: page.blob.size })) },
    },
    { init: { signal } },
  )
  const session = await unwrap<Awaited<ReturnType<typeof sessionResponse.json>>>(sessionResponse)
  const queue = [...session.pages]
  let done = 0
  const worker = async () => {
    for (let next = queue.shift(); next !== undefined; next = queue.shift()) {
      const page = pages[next.index]

      if (page === undefined) {
        throw new Error("Missing page")
      }

      const response = await fetch(next.uploadUrl, {
        method: "PUT",
        body: page.blob,
        headers: { "content-type": page.type },
        signal,
      })

      if (!response.ok) {
        throw new Error(`Upload failed with ${response.status}`)
      }

      done += 1
      onProgress(done)
    }
  }

  await Promise.all(Array.from({ length: PARALLEL_UPLOADS }, worker))
  await ensureSuccess(
    await api.chapters[":id"].pages.finalize.$post(
      { param: { id: chapterId }, json: { taskId: session.taskId } },
      { init: { signal } },
    ),
  )

  return session.taskId
}

export const getUploadStatus = async (chapterId: string, taskId: string) => {
  const response = await api.chapters[":id"].pages.status.$get({
    param: { id: chapterId },
    query: { taskId },
  })

  return (await unwrap<Awaited<ReturnType<typeof response.json>>>(response)).status
}

export const withdrawChapter = async (chapterId: string) => {
  await ensureSuccess(await api.chapters[":id"].withdraw.$post({ param: { id: chapterId } }))
}

export const chapterNumbersQueryKey = (mediaId: string, language: Language) =>
  ["medias", mediaId, "chapter-numbers", language] as const

export const fetchChapterNumbers = async (
  mediaId: string,
  language: Language,
  signal: AbortSignal,
) =>
  unwrap(
    await api.medias[":id"]["chapter-numbers"].$get(
      { param: { id: mediaId }, query: { language } },
      { init: { signal } },
    ),
  )
