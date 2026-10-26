import { useSuspenseQuery } from "@tanstack/react-query"
import { useDeferredValue } from "react"
import { latestChaptersQueryOptions } from "@/features/chapters/api/chapters"
import { LatestCompact } from "@/features/chapters/components/latest-updates/latest-compact"
import { LatestGrid } from "@/features/chapters/components/latest-updates/latest-grid"
import { LatestList } from "@/features/chapters/components/latest-updates/latest-list"
import { LATEST_UPDATES_PER_PAGE } from "@/features/home/lib/latest-updates"
import { ContentFilterEmpty } from "@/features/settings/components/content-filter"
import { type LatestUpdatesLayout, useSettings } from "@/lib/settings"
import { m } from "@/paraglide/messages"

export function LatestUpdatesContent({ layout }: { layout: LatestUpdatesLayout }) {
  const contentRatings = useDeferredValue(useSettings().contentRatings)
  const { data: chapters } = useSuspenseQuery(
    latestChaptersQueryOptions(contentRatings, LATEST_UPDATES_PER_PAGE),
  )

  if (chapters.length === 0) {
    return (
      <ContentFilterEmpty
        description={m.latest_empty_description()}
        title={m.latest_empty_title()}
      />
    )
  }

  if (layout === "GRID") {
    return <LatestGrid chapters={chapters} />
  }

  return layout === "COMPACT" ? (
    <LatestCompact chapters={chapters} />
  ) : (
    <LatestList chapters={chapters} />
  )
}
