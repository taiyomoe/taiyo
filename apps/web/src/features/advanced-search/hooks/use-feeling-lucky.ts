import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { useAdvancedSearch } from "@/features/advanced-search/hooks/use-advanced-search"
import { SEARCH_MAX_RESULTS, toSearchBody } from "@/features/advanced-search/lib/advanced-search"
import { searchMediasQueryOptions } from "@/features/media/api/medias"
import { useSettings } from "@/lib/settings"

export function useFeelingLucky() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { search } = useAdvancedSearch()
  const { contentRatings } = useSettings()

  return useMutation({
    mutationFn: async () => {
      const pick = async (page: number) =>
        queryClient.query(
          searchMediasQueryOptions(toSearchBody(search, contentRatings, { page, perPage: 1 })),
        )
      const first = await pick(1)
      const reachable = Math.min(first.meta.total, SEARCH_MAX_RESULTS)
      const index = Math.floor(Math.random() * reachable)
      const hit = index === 0 ? first.data[0] : (await pick(index + 1)).data[0]

      return hit ?? null
    },
    onSuccess: (hit) => {
      if (hit !== null) {
        void navigate({ to: "/media/$mediaId", params: { mediaId: hit.id } })
      }
    },
  })
}
