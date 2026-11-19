import type { InferResponseType } from "hono/client"
import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { ensureSuccess, unwrap } from "@/lib/envelope"

export type FeaturedMedia = InferResponseType<
  (typeof api.medias.featured.managed)["$get"],
  200
>["data"][number]

const featuredKey = ["medias", "featured", "manage"] as const

export const managedFeaturedMediasQueryOptions = queryOptions({
  queryKey: featuredKey,
  queryFn: async ({ signal }) =>
    unwrap(await api.medias.featured.managed.$get({}, { init: { signal } })),
})

/** Saves the featured medias in the given order, showing it before the server confirms. */
export const useSetFeaturedMedias = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (medias: FeaturedMedia[]) =>
      ensureSuccess(
        await api.medias.featured.$put({ json: { mediaIds: medias.map((media) => media.id) } }),
      ),
    onMutate: async (medias) => {
      await queryClient.cancelQueries({ queryKey: featuredKey })

      const previous = queryClient.getQueryData<FeaturedMedia[]>(featuredKey)

      queryClient.setQueryData(featuredKey, medias)

      return { previous }
    },
    onError: (_error, _medias, context) => {
      queryClient.setQueryData(featuredKey, context?.previous)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["medias", "featured"] }),
  })
}
