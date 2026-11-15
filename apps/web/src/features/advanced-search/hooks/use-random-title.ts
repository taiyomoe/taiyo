import { toastManager } from "@taiyomoe/ui/components/ui/toast"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import {
  type AdvancedSearch,
  SEARCH_MAX_RESULTS,
  toSearchBody,
} from "@/features/advanced-search/lib/advanced-search"
import { searchMediasQueryOptions } from "@/features/media/api/medias"
import { useSettings } from "@/lib/settings"
import { m } from "@/paraglide/messages"

export function useRandomTitle() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { contentRatings } = useSettings()

  return useMutation({
    mutationFn: async (search: AdvancedSearch) => {
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
      if (hit === null) {
        toastManager.add({ type: "info", title: m.search_lucky_empty() })

        return
      }

      void navigate({ to: "/media/$mediaId", params: { mediaId: hit.id } })
    },
    onError: () => {
      toastManager.add({ type: "error", title: m.search_lucky_failed() })
    },
  })
}
