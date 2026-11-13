import * as stylex from "@stylexjs/stylex"
import { breakpoints } from "@taiyomoe/ui/styles/tokens.stylex"
import { CatchBoundary } from "@tanstack/react-router"
import { Suspense } from "react"
import type { Session } from "@/lib/session"
import { AppShell } from "@/components/shell/app-shell"
import {
  FeaturedCarousel,
  FeaturedCarouselSkeleton,
} from "@/features/home/components/featured/featured-carousel"
import { LatestUpdates } from "@/features/home/components/latest-updates/latest-updates"
import { ForYouShelf } from "@/features/recommendations/components/for-you-shelf"

const styles = stylex.create({
  page: {
    gap: "3rem",
    paddingBlock: "2rem",
    paddingInline: {
      default: "1.25rem",
      [breakpoints.md]: "2rem",
    },
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
      <div sx={styles.page}>
        <LatestUpdates />
        <ForYouShelf />
      </div>
    </AppShell>
  )
}
