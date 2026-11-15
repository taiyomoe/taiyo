import type { CosmeticKind } from "@taiyomoe/db/cosmetics"
import type { LootBoxKey } from "@taiyomoe/db/loot-boxes"
import type { InferResponseType } from "hono/client"
import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { unwrap } from "@/lib/envelope"

export const shopQueryOptions = queryOptions({
  queryKey: ["shop"],
  queryFn: async ({ signal }) => {
    const response = await api.shop.$get({}, { init: { signal } })

    return unwrap<Awaited<ReturnType<typeof response.json>>>(response)
  },
})

export type Shop = InferResponseType<typeof api.shop.$get, 200>["data"]

export type ShopItem = Shop["items"][number]

export type ShopLootBox = Shop["lootBoxes"][number]

export type LootBoxOpening = InferResponseType<
  (typeof api.shop)["loot-boxes"][":box"]["open"]["$post"],
  201
>["data"]

const useSyncBalance = () => {
  const queryClient = useQueryClient()

  return (balance: number, owned?: { kind: CosmeticKind; key: string }) => {
    queryClient.setQueryData(shopQueryOptions.queryKey, (current) =>
      current === undefined
        ? current
        : {
            ...current,
            balance,
            items:
              owned === undefined
                ? current.items
                : current.items.map((item) =>
                    item.kind === owned.kind && item.key === owned.key
                      ? { ...item, owned: true, unlocked: true }
                      : item,
                  ),
          },
    )
  }
}
const invalidateProfileData = (queryClient: ReturnType<typeof useQueryClient>) =>
  Promise.all([
    queryClient.invalidateQueries({ queryKey: shopQueryOptions.queryKey }),
    queryClient.invalidateQueries({ queryKey: ["users", "profile"] }),
    queryClient.invalidateQueries({ queryKey: ["users", "me", "cosmetics"] }),
  ])

export function useBuyShopItem() {
  const queryClient = useQueryClient()
  const syncBalance = useSyncBalance()

  return useMutation({
    mutationFn: async (item: { kind: CosmeticKind; key: string }) => {
      const response = await api.shop.purchases.$post({ json: item })

      return unwrap<Awaited<ReturnType<typeof response.json>>>(response)
    },
    onSuccess: (purchase) => {
      syncBalance(purchase.balance, purchase.item)
    },
    onSettled: () => invalidateProfileData(queryClient),
  })
}

export function useOpenLootBox() {
  const queryClient = useQueryClient()
  const syncBalance = useSyncBalance()

  return useMutation({
    mutationFn: async (box: LootBoxKey) => {
      const response = await api.shop["loot-boxes"][":box"].open.$post({ param: { box } })

      return unwrap<Awaited<ReturnType<typeof response.json>>>(response)
    },
    onSuccess: (opening) => {
      syncBalance(opening.balance, opening.item)
    },
    onSettled: () => invalidateProfileData(queryClient),
  })
}
