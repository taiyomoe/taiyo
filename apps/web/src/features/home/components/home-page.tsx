import * as stylex from "@stylexjs/stylex"
import { CatchBoundary } from "@tanstack/react-router"
import { Suspense } from "react"
import type { Session } from "@/lib/session"
import { pageFrame } from "@/components/layout/page-frame"
import { AppShell } from "@/components/shell/app-shell"
import {
  FeaturedCarousel,
  FeaturedCarouselSkeleton,
} from "@/features/home/components/featured/featured-carousel"
import { LatestUpdates } from "@/features/home/components/latest-updates/latest-updates"
import { RecentlyAdded } from "@/features/home/components/recently-added/recently-added"

const styles = stylex.create({
  page: {
    gap: "3rem",
    paddingBlock: "2rem",
    display: "flex",
    flexDirection: "column",
  },
})

export function HomePage({ user }: { user: Session["user"] }) {
  return (
    <AppShell overlayNavbar user={user}>
      <CatchBoundary errorComponent={() => null} getResetKey={() => "featured"}>
        <Suspense fallback={<FeaturedCarouselSkeleton />}>
          <FeaturedCarousel />
        </Suspense>
      </CatchBoundary>
      <div sx={[pageFrame.frame, styles.page]}>
        <LatestUpdates />
        <RecentlyAdded />
      </div>
    </AppShell>
  )
}
