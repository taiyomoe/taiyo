import type { InferResponseType } from "hono/client"
import {
  type InfiniteData,
  infiniteQueryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"
import { mapCachedComments } from "@/features/comments/api/comments"
import { api } from "@/lib/api"
import { unwrap, unwrapEnvelope } from "@/lib/envelope"

export type ImageCollection = "favorites" | "uploads"

type ImagesPage = Pick<
  InferResponseType<(typeof api)["comment-images"]["me"]["$get"], 200>,
  "data" | "meta"
>

export type LibraryImage = ImagesPage["data"][number]

export type UploadedImage = Omit<LibraryImage, "favorited">

export const myCommentImagesQueryOptions = (collection: ImageCollection) =>
  infiniteQueryOptions({
    queryKey: ["comment-images", collection],
    initialPageParam: null as string | null,
    queryFn: async ({ signal, pageParam }): Promise<ImagesPage> => {
      const response = await api["comment-images"].me.$get(
        { query: { collection, ...(pageParam === null ? {} : { cursor: pageParam }) } },
        { init: { signal } },
      )
      const { data, meta } =
        await unwrapEnvelope<Awaited<ReturnType<typeof response.json>>>(response)

      return { data, meta }
    },
    getNextPageParam: (last) => last.meta.nextCursor,
  })

export function useUploadCommentImage() {
  return useMutation({
    mutationFn: async (file: File) => {
      const body = new FormData()

      body.set("file", file)

      // The Hono client has no typed multipart input for this route, so the
      // request goes through fetch and the envelope is typed by hand.
      const response = await fetch(api["comment-images"].$url(), {
        method: "POST",
        body,
        credentials: "include",
      })

      return unwrap(
        response as {
          status: number
          json: () => Promise<
            | { success: true; data: UploadedImage }
            | { success: false; code: string; message: string }
          >
        },
      )
    },
  })
}

export function useFavoriteCommentImage() {
  const queryClient = useQueryClient()
  const apply = (id: string, favorited: boolean) => {
    mapCachedComments(queryClient, (comment) =>
      comment.images.some((image) => image.id === id)
        ? {
            ...comment,
            images: comment.images.map((image) =>
              image.id === id ? { ...image, favorited } : image,
            ),
          }
        : comment,
    )
    queryClient.setQueriesData<InfiniteData<ImagesPage>>({ queryKey: ["comment-images"] }, (data) =>
      data === undefined
        ? data
        : {
            ...data,
            pages: data.pages.map((page) => ({
              ...page,
              data: page.data.map((image) => (image.id === id ? { ...image, favorited } : image)),
            })),
          },
    )
  }

  return useMutation({
    mutationFn: async ({ id, favorited }: { id: string; favorited: boolean }) => {
      const request = { param: { id } }
      const response = favorited
        ? await api["comment-images"][":id"].favorite.$put(request)
        : await api["comment-images"][":id"].favorite.$delete(request)

      return unwrap<Awaited<ReturnType<typeof response.json>>>(response)
    },
    onMutate: ({ id, favorited }) => {
      apply(id, favorited)
    },
    onError: (_error, { id, favorited }) => {
      apply(id, !favorited)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["comment-images", "favorites"] }),
  })
}

export function useRemoveCommentImage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api["comment-images"][":id"].$delete({
        param: { id },
        json: { block: true },
      })

      return unwrap<Awaited<ReturnType<typeof response.json>>>(response)
    },
    onSuccess: ({ id }) => {
      mapCachedComments(queryClient, (comment) =>
        comment.images.some((image) => image.id === id)
          ? {
              ...comment,
              images: comment.images.map((image) =>
                image.id === id ? { ...image, url: null, favorited: false } : image,
              ),
            }
          : comment,
      )
      void queryClient.invalidateQueries({ queryKey: ["comment-images"] })
    },
  })
}
