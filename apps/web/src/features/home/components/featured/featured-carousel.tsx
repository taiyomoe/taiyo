import * as stylex from "@stylexjs/stylex"
import { breakpoints, colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { useSuspenseQuery } from "@tanstack/react-query"
import { useDeferredValue } from "react"
import { FeaturedCarouselView } from "@/features/home/components/featured/featured-carousel-view"
import { FeaturedSlideSkeleton } from "@/features/home/components/featured/featured-slide-skeleton"
import { featuredStyles } from "@/features/home/components/featured/featured-styles"
import { featuredMediasQueryOptions } from "@/features/media/api/medias"
import { ContentFilterEmpty } from "@/features/settings/components/content-filter"
import { useSettings } from "@/lib/settings"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  empty: {
    borderBottomColor: colors.border,
    borderBottomStyle: "solid",
    borderBottomWidth: 1,
    paddingTop: { default: "var(--navbar-height)", [breakpoints.md]: 0 },
  },
})

export function FeaturedCarousel() {
  const contentRatings = useDeferredValue(useSettings().contentRatings)
  const { data: medias } = useSuspenseQuery(featuredMediasQueryOptions(contentRatings))

  if (medias.length > 0) {
    return <FeaturedCarouselView key={medias.map((media) => media.id).join()} medias={medias} />
  }

  return (
    <div sx={[featuredStyles.root, styles.empty]}>
      <ContentFilterEmpty
        description={m.home_featured_empty_description()}
        title={m.home_featured_empty_title()}
      />
    </div>
  )
}

export function FeaturedCarouselSkeleton() {
  return (
    <div sx={featuredStyles.root}>
      <FeaturedSlideSkeleton />
    </div>
  )
}
