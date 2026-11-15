import type { LatestUpdatesLayout } from "@/lib/settings"
import { LatestCompactSkeleton } from "@/features/chapters/components/latest-updates/latest-compact"
import { LatestGridSkeleton } from "@/features/chapters/components/latest-updates/latest-grid"
import { LatestListSkeleton } from "@/features/chapters/components/latest-updates/latest-list"
import { LATEST_UPDATES_PER_PAGE } from "@/features/home/lib/latest-updates"

export function LatestUpdatesSkeleton({ layout }: { layout: LatestUpdatesLayout }) {
  if (layout === "GRID") {
    return <LatestGridSkeleton count={LATEST_UPDATES_PER_PAGE} />
  }

  return layout === "COMPACT" ? (
    <LatestCompactSkeleton count={LATEST_UPDATES_PER_PAGE} />
  ) : (
    <LatestListSkeleton count={LATEST_UPDATES_PER_PAGE} />
  )
}
