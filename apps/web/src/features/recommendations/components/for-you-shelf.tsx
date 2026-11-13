import * as stylex from "@stylexjs/stylex"
import { breakpoints, colors, font, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { useQuery } from "@tanstack/react-query"
import { useDeferredValue } from "react"
import { sceneFont } from "@/components/scene/scene.stylex"
import { myRecommendationsQueryOptions } from "@/features/recommendations/api/recommendations"
import { RecommendationCard } from "@/features/recommendations/components/recommendation-card"
import {
  RecommendationGrid,
  RecommendationGridItem,
  RecommendationGridSkeleton,
} from "@/features/recommendations/components/recommendation-grid"
import { useRecommendationTracking } from "@/features/recommendations/hooks/use-recommendation-tracking"
import { useSettings } from "@/lib/settings"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  section: {
    gap: "1.25rem",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  heading: {
    margin: 0,
    gap: "0.75rem",
    alignItems: "center",
    color: colors.foreground,
    display: "flex",
    fontFamily: sceneFont.display,
    fontSize: { default: "1.5rem", [breakpoints.md]: "1.875rem" },
    fontWeight: font.weightBold,
    letterSpacing: "-0.02em",
  },
  accent: {
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    flexShrink: 0,
    height: "0.1875rem",
    width: "1.25rem",
  },
})

export function ForYouShelf() {
  const contentRatings = useDeferredValue(useSettings().contentRatings)
  const { data, isError } = useQuery(myRecommendationsQueryOptions(contentRatings))
  const { observe, onOpen } = useRecommendationTracking({
    surface: "FOR_YOU",
    sourceMediaId: null,
    mediaIds: data?.map((media) => media.id) ?? [],
  })

  if (isError || data?.length === 0) {
    return null
  }

  return (
    <section aria-labelledby="for-you" sx={styles.section}>
      <h2 id="for-you" sx={styles.heading}>
        <span aria-hidden sx={styles.accent} />
        {m.for_you_title()}
      </h2>
      {data === undefined ? (
        <RecommendationGridSkeleton count={8} layout="shelf" />
      ) : (
        <RecommendationGrid layout="shelf" ref={observe}>
          {data.map((media, position) => (
            <RecommendationGridItem key={media.id}>
              <RecommendationCard
                detail={
                  media.because === null || media.because.title === null
                    ? m.for_you_popular()
                    : m.for_you_because({ title: media.because.title })
                }
                media={media}
                onOpen={() => {
                  onOpen(media.id, position)
                }}
              />
            </RecommendationGridItem>
          ))}
        </RecommendationGrid>
      )}
    </section>
  )
}
