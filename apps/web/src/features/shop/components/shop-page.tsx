import * as stylex from "@stylexjs/stylex"
import { getRouteApi } from "@tanstack/react-router"
import { Suspense } from "react"
import { layout } from "@/components/layout/layout.stylex"
import { AppShell } from "@/components/shell/app-shell"
import { ShopContent, ShopContentSkeleton } from "@/features/shop/components/shop-content"

const routeApi = getRouteApi("/shop")
const styles = stylex.create({
  page: {
    marginInline: "auto",
    paddingBlock: "2rem",
    paddingInline: layout.gutter,
    maxWidth: "88rem",
    width: "100%",
  },
})

export function ShopPage() {
  const { session } = routeApi.useRouteContext()
  const { user } = session
  const username = user.username ?? user.name
  const viewer = {
    id: user.id,
    displayUsername: user.displayUsername ?? username,
    image: user.image ?? null,
  }

  return (
    <AppShell user={user}>
      <div sx={styles.page}>
        <Suspense fallback={<ShopContentSkeleton />}>
          <ShopContent username={username} viewer={viewer} />
        </Suspense>
      </div>
    </AppShell>
  )
}
