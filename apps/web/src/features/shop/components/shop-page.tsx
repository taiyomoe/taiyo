import * as stylex from "@stylexjs/stylex"
import { getRouteApi } from "@tanstack/react-router"
import { Suspense } from "react"
import { pageFrame } from "@/components/layout/page-frame"
import { AppShell } from "@/components/shell/app-shell"
import { ShopContent, ShopContentSkeleton } from "@/features/shop/components/shop-content"

const routeApi = getRouteApi("/shop")
const styles = stylex.create({
  page: {
    paddingBlock: "2rem",
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
      <div sx={[pageFrame.frame, styles.page]}>
        <Suspense fallback={<ShopContentSkeleton />}>
          <ShopContent username={username} viewer={viewer} />
        </Suspense>
      </div>
    </AppShell>
  )
}
