import type {
  ChapterStatus,
  ContentRating,
  MediaLanguage,
  MediaStatus,
  MediaType,
  SupportedLanguage,
} from "@taiyomoe/db/constants"
import type { InferResponseType } from "hono/client"
import { keepPreviousData, queryOptions, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { ensureSuccess, unwrap, unwrapEnvelope } from "@/lib/envelope"

export const CATALOG_PER_PAGE = 20

export type MediasFilter = {
  search?: string | undefined
  type?: MediaType | undefined
  status?: MediaStatus | undefined
  deleted?: boolean | undefined
  page: number
}

export type ChaptersFilter = {
  search?: string | undefined
  status?: ChapterStatus | undefined
  language?: SupportedLanguage | undefined
  page: number
}

export type ImagesFilter = {
  search?: string | undefined
  contentRating?: ContentRating | undefined
  language?: MediaLanguage | undefined
  page: number
}

export type ManagedMedia = InferResponseType<typeof api.medias.$get, 200>["data"][number]

export type ManagedChapter = InferResponseType<typeof api.chapters.$get, 200>["data"][number]

export type ManagedCover = InferResponseType<typeof api.covers.$get, 200>["data"][number]

export type ManagedBanner = InferResponseType<typeof api.banners.$get, 200>["data"][number]

export type MediaDeletionImpact = InferResponseType<
  (typeof api.medias)[":id"]["deletion-impact"]["$get"],
  200
>["data"]

export type BulkResult = { done: string[]; skipped: Array<{ id: string; reason: string }> }

export type ChapterDeletionImpact = InferResponseType<
  (typeof api.chapters)[":id"]["deletion-impact"]["$get"],
  200
>["data"]

const pageQuery = (page: number) => ({ page: String(page), perPage: String(CATALOG_PER_PAGE) })
const defined = (query: Record<string, string | undefined>) =>
  Object.fromEntries(Object.entries(query).filter(([, value]) => value !== undefined))

export const managedMediasQueryOptions = (filter: MediasFilter) =>
  queryOptions({
    queryKey: ["medias", "manage", filter],
    queryFn: async ({ signal }) => {
      const response = await api.medias.$get(
        {
          query: {
            ...pageQuery(filter.page),
            ...defined({
              search: filter.search,
              type: filter.type,
              status: filter.status,
              deleted: filter.deleted === true ? "true" : undefined,
            }),
          },
        },
        { init: { signal } },
      )

      return unwrapEnvelope<Awaited<ReturnType<typeof response.json>>>(response)
    },
    placeholderData: keepPreviousData,
  })

export const managedChaptersQueryOptions = (filter: ChaptersFilter) =>
  queryOptions({
    queryKey: ["chapters", "manage", filter],
    queryFn: async ({ signal }) =>
      unwrapEnvelope(
        await api.chapters.$get(
          {
            query: {
              ...pageQuery(filter.page),
              ...defined({
                search: filter.search,
                status: filter.status,
                language: filter.language,
              }),
            },
          },
          { init: { signal } },
        ),
      ),
    placeholderData: keepPreviousData,
  })

export const managedCoversQueryOptions = (filter: ImagesFilter) =>
  queryOptions({
    queryKey: ["covers", "manage", filter],
    queryFn: async ({ signal }) =>
      unwrapEnvelope(
        await api.covers.$get(
          {
            query: {
              ...pageQuery(filter.page),
              ...defined({
                search: filter.search,
                contentRating: filter.contentRating,
                language: filter.language,
              }),
            },
          },
          { init: { signal } },
        ),
      ),
    placeholderData: keepPreviousData,
  })

export const managedBannersQueryOptions = (filter: ImagesFilter) =>
  queryOptions({
    queryKey: ["banners", "manage", filter],
    queryFn: async ({ signal }) =>
      unwrapEnvelope(
        await api.banners.$get(
          {
            query: {
              ...pageQuery(filter.page),
              ...defined({ search: filter.search, contentRating: filter.contentRating }),
            },
          },
          { init: { signal } },
        ),
      ),
    placeholderData: keepPreviousData,
  })

export const mediaDeletionImpactQueryOptions = (mediaId: string) =>
  queryOptions({
    queryKey: ["medias", mediaId, "deletion-impact"],
    queryFn: async ({ signal }) =>
      unwrap(
        await api.medias[":id"]["deletion-impact"].$get(
          { param: { id: mediaId } },
          { init: { signal } },
        ),
      ),
    staleTime: 0,
  })

export const chapterDeletionImpactQueryOptions = (chapterId: string) =>
  queryOptions({
    queryKey: ["chapters", chapterId, "deletion-impact"],
    queryFn: async ({ signal }) =>
      unwrap(
        await api.chapters[":id"]["deletion-impact"].$get(
          { param: { id: chapterId } },
          { init: { signal } },
        ),
      ),
    staleTime: 0,
  })

export const mediasDeletionImpactQueryOptions = (mediaIds: readonly string[]) =>
  queryOptions({
    queryKey: ["medias", [...mediaIds].sort(), "deletion-impact"],
    queryFn: async ({ signal }) =>
      unwrap(
        await api.medias["deletion-impact"].$get(
          { query: { ids: mediaIds.join(",") } },
          { init: { signal } },
        ),
      ),
    staleTime: 0,
  })

export const chaptersDeletionImpactQueryOptions = (chapterIds: readonly string[]) =>
  queryOptions({
    queryKey: ["chapters", [...chapterIds].sort(), "deletion-impact"],
    queryFn: async ({ signal }) =>
      unwrap(
        await api.chapters["deletion-impact"].$get(
          { query: { ids: chapterIds.join(",") } },
          { init: { signal } },
        ),
      ),
    staleTime: 0,
  })

const useInvalidateCatalog = () => {
  const queryClient = useQueryClient()

  return () =>
    Promise.all(
      ["medias", "chapters", "covers", "banners", "chapter-review"].map((key) =>
        queryClient.invalidateQueries({
          queryKey: [key],
          predicate: (query) => !query.queryKey.includes("deletion-impact"),
        }),
      ),
    )
}

export function useDeleteMedia() {
  const invalidate = useInvalidateCatalog()

  return useMutation({
    mutationFn: async (id: string) =>
      ensureSuccess(await api.medias[":id"].$delete({ param: { id } })),
    onSuccess: invalidate,
  })
}

export function useRestoreMedia() {
  const invalidate = useInvalidateCatalog()

  return useMutation({
    mutationFn: async (id: string) =>
      ensureSuccess(await api.medias[":id"].restore.$post({ param: { id } })),
    onSuccess: invalidate,
  })
}

export function useDeleteChapter() {
  const invalidate = useInvalidateCatalog()

  return useMutation({
    mutationFn: async (id: string) =>
      ensureSuccess(await api.chapters[":id"].$delete({ param: { id } })),
    onSuccess: invalidate,
  })
}

export function useCreateMedia() {
  const invalidate = useInvalidateCatalog()

  return useMutation({
    mutationFn: async (form: FormData) => {
      // The Hono client has no typed multipart input for this route, so the
      // request goes through fetch and the envelope is typed by hand.
      const response = await fetch(api.medias.$url().toString(), {
        method: "POST",
        body: form,
        credentials: "include",
      })

      return unwrap(
        response as {
          status: number
          json: () => Promise<
            | { success: true; data: { id: string } }
            | { success: false; code: string; message: string }
          >
        },
      )
    },
    onSuccess: invalidate,
  })
}

const useBulkMutation = <TInput>(run: (input: TInput) => Promise<BulkResult>) => {
  const invalidate = useInvalidateCatalog()

  return useMutation({ mutationFn: run, onSuccess: invalidate })
}

export const useBulkUpdateMedias = () =>
  useBulkMutation(async (json: Parameters<typeof api.medias.$patch>[0]["json"]) =>
    unwrap(await api.medias.$patch({ json })),
  )

export const useBulkDeleteMedias = () =>
  useBulkMutation(async (mediaIds: string[]) =>
    unwrap(await api.medias.$delete({ json: { mediaIds } })),
  )

export const useBulkRestoreMedias = () =>
  useBulkMutation(async (mediaIds: string[]) =>
    unwrap(await api.medias.restore.$post({ json: { mediaIds } })),
  )

export const useBulkUpdateChapters = () =>
  useBulkMutation(async (json: Parameters<typeof api.chapters.$patch>[0]["json"]) => {
    const response = await api.chapters.$patch({ json })

    return unwrap<Awaited<ReturnType<typeof response.json>>>(response)
  })

export const useBulkDeleteChapters = () =>
  useBulkMutation(async (chapterIds: string[]) =>
    unwrap(await api.chapters.$delete({ json: { chapterIds } })),
  )

export const useBulkUpdateCovers = () =>
  useBulkMutation(async (json: Parameters<typeof api.covers.$patch>[0]["json"]) =>
    unwrap(await api.covers.$patch({ json })),
  )

export const useBulkDeleteCovers = () =>
  useBulkMutation(async (coverIds: string[]) =>
    unwrap(await api.covers.$delete({ json: { coverIds } })),
  )

export const useBulkUpdateBanners = () =>
  useBulkMutation(async (json: Parameters<typeof api.banners.$patch>[0]["json"]) =>
    unwrap(await api.banners.$patch({ json })),
  )

export const useBulkDeleteBanners = () =>
  useBulkMutation(async (bannerIds: string[]) =>
    unwrap(await api.banners.$delete({ json: { bannerIds } })),
  )
