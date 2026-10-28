import * as stylex from "@stylexjs/stylex"
import { colors, radius, shadows } from "@taiyomoe/ui/styles/tokens.stylex"
import { Link } from "@tanstack/react-router"
import type { FeaturedMedia } from "@/features/media/api/medias"
import { FeaturedSlideDetails } from "@/features/home/components/featured/featured-slide-details"
import { featuredStyles } from "@/features/home/components/featured/featured-styles"
import { Cover } from "@/features/media/components/cover"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  backdropImage: {
    filter: "blur(4px)",
    objectFit: "cover",
    objectPosition: "50% 30%",
    position: "absolute",
    transform: "scale(1.05)",
    height: "150%",
    left: 0,
    top: 0,
    width: "100%",
  },
  coverLink: {
    borderRadius: radius.lg,
    boxShadow: shadows.overlay,
    display: "block",
    flexShrink: 0,
    outlineColor: colors.ring,
    outlineOffset: 3,
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: 2,
  },
})

export function FeaturedSlide({
  media,
  index,
  total,
}: {
  media: FeaturedMedia
  index: number
  total: number
}) {
  const backdropUrl = media.bannerUrl ?? media.coverUrl
  const eager = index === 0

  return (
    <div
      aria-label={m.home_featured_slide({ index: index + 1, total })}
      aria-roledescription="slide"
      role="group"
      sx={featuredStyles.slide}
    >
      <div aria-hidden sx={featuredStyles.backdrop}>
        {backdropUrl === null ? null : <Backdrop eager={eager} src={backdropUrl} />}
        <div sx={featuredStyles.shade} />
      </div>
      <div sx={featuredStyles.content}>
        <Link
          aria-label={media.title ?? undefined}
          draggable={false}
          params={{ mediaId: media.id }}
          {...stylex.props(styles.coverLink)}
          to="/media/$mediaId"
        >
          <Cover priority={eager ? "high" : "low"} src={media.coverUrl} sx={featuredStyles.cover} />
        </Link>
        <FeaturedSlideDetails media={media} />
      </div>
    </div>
  )
}

function Backdrop({ src, eager }: { src: string; eager: boolean }) {
  return (
    <img
      alt=""
      decoding={eager ? "sync" : "async"}
      draggable={false}
      fetchPriority={eager ? "high" : "low"}
      src={src}
      sx={styles.backdropImage}
    />
  )
}
