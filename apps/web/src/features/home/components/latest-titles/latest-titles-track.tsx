import type { EmblaRootNodeRefType } from "embla-carousel-react"
import * as stylex from "@stylexjs/stylex"
import { breakpoints } from "@taiyomoe/ui/styles/tokens.stylex"
import { useSuspenseQuery } from "@tanstack/react-query"
import { useDeferredValue } from "react"
import { range } from "remeda"
import {
  LatestTitleCard,
  LatestTitleCardSkeleton,
} from "@/features/home/components/latest-titles/latest-title-card"
import { LATEST_TITLES_COUNT } from "@/features/home/lib/latest-titles"
import { recentlyAddedQueryOptions } from "@/features/recently-added/api/recently-added"
import { ContentFilterEmpty } from "@/features/settings/components/content-filter"
import { useSettings } from "@/lib/settings"
import { m } from "@/paraglide/messages"

const SLIDE_INSET = "0.5rem"
const styles = stylex.create({
  viewport: {
    marginBlock: `calc(-1 * ${SLIDE_INSET})`,
    marginInline: `calc(-1 * ${SLIDE_INSET})`,
    overflow: "hidden",
    paddingBlock: SLIDE_INSET,
  },
  container: {
    display: "flex",
    touchAction: "pan-y pinch-zoom",
  },
  slide: {
    paddingInline: SLIDE_INSET,
    flexBasis: {
      default: "42%",
      [breakpoints.sm]: {
        default: "30%",
        [breakpoints.md]: {
          default: "25%",
          [breakpoints.lg]: {
            default: "20%",
            [breakpoints.xl]: "calc(100% / 6)",
          },
        },
      },
    },
    flexGrow: 0,
    flexShrink: 0,
    minWidth: 0,
  },
})

export function LatestTitlesTrack({ viewportRef }: { viewportRef: EmblaRootNodeRefType }) {
  const contentRatings = useDeferredValue(useSettings().contentRatings)
  const { data } = useSuspenseQuery(
    recentlyAddedQueryOptions(contentRatings, 1, LATEST_TITLES_COUNT),
  )

  if (data.data.length === 0) {
    return (
      <ContentFilterEmpty
        description={m.recently_added_empty_description()}
        title={m.recently_added_empty_title()}
      />
    )
  }

  return (
    <div ref={viewportRef} sx={styles.viewport}>
      <div sx={styles.container}>
        {data.data.map((hit, index) => (
          <div
            key={hit.id}
            aria-label={m.home_featured_slide({ index: index + 1, total: data.data.length })}
            aria-roledescription="slide"
            role="group"
            sx={styles.slide}
          >
            <LatestTitleCard hit={hit} />
          </div>
        ))}
      </div>
    </div>
  )
}

export function LatestTitlesTrackSkeleton() {
  return (
    <div aria-hidden sx={styles.viewport}>
      <div sx={styles.container}>
        {range(0, 6).map((index) => (
          <div key={index} sx={styles.slide}>
            <LatestTitleCardSkeleton />
          </div>
        ))}
      </div>
    </div>
  )
}
