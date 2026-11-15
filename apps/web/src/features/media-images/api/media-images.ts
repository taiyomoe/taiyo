import type { ContentRating, MediaLanguage } from "@taiyomoe/db/constants"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { ensureSuccess, unwrap } from "@/lib/envelope"

export type NewCover = {
  file: File
  volume: number | null
  language: MediaLanguage
  contentRating: ContentRating
  main: boolean
}

export type NewBanner = { file: File; contentRating: ContentRating }

export type CoverPatch = {
  volume?: number | null
  language?: MediaLanguage
  contentRating?: ContentRating
}

const UPLOAD_BATCH_SIZE = 4
const postImages = async (url: string, field: "covers" | "banners", entries: object[]) => {
  const body = new FormData()

  for (const [index, entry] of entries.entries()) {
    for (const [key, value] of Object.entries(entry)) {
      if (value !== null && value !== undefined) {
        body.append(`${field}.${index}.${key}`, value instanceof File ? value : String(value))
      }
    }
  }

  // The Hono client has no typed multipart input for these routes, so the
  // request goes through fetch and the envelope is typed by hand.
  const response = await fetch(url, { method: "POST", body, credentials: "include" })

  return unwrap(
    response as {
      status: number
      json: () => Promise<
        | { success: true; data: { ids: string[] } }
        | { success: false; code: string; message: string }
      >
    },
  )
}
const useInvalidateMedia = (mediaId: string) => {
  const queryClient = useQueryClient()

  return () => queryClient.invalidateQueries({ queryKey: ["medias", mediaId] })
}

export function useUploadCovers(mediaId: string) {
  const invalidate = useInvalidateMedia(mediaId)

  return useMutation({
    mutationFn: async ({
      covers,
      onProgress,
    }: {
      covers: NewCover[]
      onProgress: (done: number) => void
    }) => {
      const url = api.medias[":id"].covers.$url({ param: { id: mediaId } }).toString()
      const ordered = [...covers].sort((a, b) => Number(a.main) - Number(b.main))

      for (let start = 0; start < ordered.length; start += UPLOAD_BATCH_SIZE) {
        await postImages(url, "covers", ordered.slice(start, start + UPLOAD_BATCH_SIZE))
        onProgress(Math.min(start + UPLOAD_BATCH_SIZE, ordered.length))
      }
    },
    onSettled: invalidate,
  })
}

export function useUploadBanners(mediaId: string) {
  const invalidate = useInvalidateMedia(mediaId)

  return useMutation({
    mutationFn: async ({
      banners,
      onProgress,
    }: {
      banners: NewBanner[]
      onProgress: (done: number) => void
    }) => {
      const url = api.medias[":id"].banners.$url({ param: { id: mediaId } }).toString()

      for (let start = 0; start < banners.length; start += UPLOAD_BATCH_SIZE) {
        await postImages(url, "banners", banners.slice(start, start + UPLOAD_BATCH_SIZE))
        onProgress(Math.min(start + UPLOAD_BATCH_SIZE, banners.length))
      }
    },
    onSettled: invalidate,
  })
}

export function useUpdateCover(mediaId: string) {
  const invalidate = useInvalidateMedia(mediaId)

  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: CoverPatch }) => {
      await ensureSuccess(await api.covers[":id"].$patch({ param: { id }, json: patch }))
    },
    onSettled: invalidate,
  })
}

export function useSetMainCover(mediaId: string) {
  const invalidate = useInvalidateMedia(mediaId)

  return useMutation({
    mutationFn: async (id: string) => {
      await ensureSuccess(await api.covers[":id"]["set-main"].$post({ param: { id } }))
    },
    onSettled: invalidate,
  })
}

export function useDeleteCover(mediaId: string) {
  const invalidate = useInvalidateMedia(mediaId)

  return useMutation({
    mutationFn: async (id: string) => {
      await ensureSuccess(await api.covers[":id"].$delete({ param: { id } }))
    },
    onSettled: invalidate,
  })
}

export function useUpdateBanner(mediaId: string) {
  const invalidate = useInvalidateMedia(mediaId)

  return useMutation({
    mutationFn: async ({ id, contentRating }: { id: string; contentRating: ContentRating }) => {
      await ensureSuccess(
        await api.banners[":id"].$patch({ param: { id }, json: { contentRating } }),
      )
    },
    onSettled: invalidate,
  })
}

export function useDeleteBanner(mediaId: string) {
  const invalidate = useInvalidateMedia(mediaId)

  return useMutation({
    mutationFn: async (id: string) => {
      await ensureSuccess(await api.banners[":id"].$delete({ param: { id } }))
    },
    onSettled: invalidate,
  })
}
