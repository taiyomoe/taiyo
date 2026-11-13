import * as stylex from "@stylexjs/stylex"
import { Sparkles } from "@taiyomoe/ui/components/icons"
import { useQuery } from "@tanstack/react-query"
import { useDeferredValue } from "react"
import { ErrorAlert } from "@/components/feedback/error-alert"
import { MediaImagesEmpty } from "@/features/media/components/media-images-empty"
import { InfoSection } from "@/features/media/components/media-info/info-section"
import { relatedMediasQueryOptions } from "@/features/recommendations/api/recommendations"
import { RecommendationCard } from "@/features/recommendations/components/recommendation-card"
import {
  RecommendationGrid,
  RecommendationGridItem,
  RecommendationGridSkeleton,
} from "@/features/recommendations/components/recommendation-grid"
import { useRecommendationTracking } from "@/features/recommendations/hooks/use-recommendation-tracking"
import {
  getReasonText,
  RELATION_TYPE_LABELS,
} from "@/features/recommendations/lib/recommendation-labels"
import { getErrorMessage } from "@/lib/errors"
import { useSettings } from "@/lib/settings"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  root: {
    gap: "2.5rem",
    display: "flex",
    flexDirection: "column",
  },
})

export function MediaRelated({ mediaId }: { mediaId: string }) {
  const contentRatings = useDeferredValue(useSettings().contentRatings)
  const { data, error } = useQuery(relatedMediasQueryOptions(mediaId, contentRatings))
  const { observe, onOpen } = useRecommendationTracking({
    surface: "RELATED",
    sourceMediaId: mediaId,
    mediaIds: data?.similar.map((media) => media.id) ?? [],
  })

  if (error !== null) {
    return <ErrorAlert message={getErrorMessage(error)} />
  }

  if (data === undefined) {
    return (
      <div sx={styles.root}>
        <InfoSection title={m.related_similar_title()}>
          <RecommendationGridSkeleton />
        </InfoSection>
      </div>
    )
  }

  if (data.relations.length === 0 && data.similar.length === 0) {
    return (
      <MediaImagesEmpty
        description={m.related_empty_description()}
        icon={<Sparkles />}
        title={m.related_empty_title()}
      />
    )
  }

  return (
    <div sx={styles.root}>
      {data.relations.length === 0 ? null : (
        <InfoSection title={m.related_relations_title()}>
          <RecommendationGrid layout="shelf">
            {data.relations.map((media) => (
              <RecommendationGridItem key={media.id}>
                <RecommendationCard
                  badge={RELATION_TYPE_LABELS[media.relationType]()}
                  media={media}
                />
              </RecommendationGridItem>
            ))}
          </RecommendationGrid>
        </InfoSection>
      )}
      {data.similar.length === 0 ? null : (
        <InfoSection title={m.related_similar_title()}>
          <RecommendationGrid ref={observe}>
            {data.similar.map((media, position) => (
              <RecommendationGridItem key={media.id}>
                <RecommendationCard
                  detail={getReasonText(media.reasons)}
                  media={media}
                  onOpen={() => {
                    onOpen(media.id, position)
                  }}
                />
              </RecommendationGridItem>
            ))}
          </RecommendationGrid>
        </InfoSection>
      )}
    </div>
  )
}
