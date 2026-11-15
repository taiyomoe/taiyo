import { noop } from "@tanstack/react-query"
import { createFileRoute, redirect } from "@tanstack/react-router"
import { shopQueryOptions } from "@/features/shop/api/shop"
import { ShopPage } from "@/features/shop/components/shop-page"
import { m } from "@/paraglide/messages"

export const Route = createFileRoute("/shop")({
  head: () => ({ meta: [{ title: m.shop_meta_title() }] }),
  beforeLoad: ({ context }) => {
    if (!context.session) {
      throw redirect({ to: "/auth/sign-in" })
    }

    return { session: context.session }
  },
  loader: async ({ context }) => {
    const prefetch = context.queryClient.query(shopQueryOptions).catch(noop)

    if (import.meta.env.SSR) {
      await prefetch
    }
  },
  component: ShopPage,
})
