import * as stylex from "@stylexjs/stylex"
import { colors, radius, shadows } from "@taiyomoe/ui/styles/tokens.stylex"
import { Link } from "@tanstack/react-router"
import type { SearchHit } from "@/features/advanced-search/hooks/use-search-results"
import { CountryFlag } from "@/components/flags/flags"
import { Cover, CoverSkeleton } from "@/features/media/components/cover"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  tile: {
    borderRadius: radius.lg,
    overflow: "hidden",
    boxShadow: shadows.raised,
    display: "block",
    isolation: "isolate",
    outlineColor: colors.ring,
    outlineOffset: 3,
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: 2,
    position: "relative",
    textDecorationLine: "none",
  },
  cover: {
    width: "100%",
  },
  caption: {
    gap: "0.375rem",
    paddingInline: "0.625rem",
    alignItems: "flex-start",
    backgroundImage: "linear-gradient(to top, rgb(0 0 0 / 88%), rgb(0 0 0 / 55%) 55%, transparent)",
    color: "white",
    display: "flex",
    fontSize: "0.875rem",
    fontWeight: 600,
    lineHeight: 1.3,
    pointerEvents: "none",
    position: "absolute",
    textShadow: "0 1px 2px rgb(0 0 0 / 60%)",
    zIndex: 1,
    bottom: 0,
    left: 0,
    paddingBottom: "0.625rem",
    paddingTop: "2.5rem",
    right: 0,
  },
  flag: {
    display: "inline-flex",
    flexShrink: 0,
    marginTop: "0.125rem",
  },
  title: {
    overflow: "hidden",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: 2,
    display: "-webkit-box",
  },
})

export function ResultTile({ hit }: { hit: SearchHit }) {
  const title = hit.mainTitle?.title ?? m.media_untitled()

  return (
    <Link
      params={{ mediaId: hit.id }}
      title={title}
      to="/media/$mediaId"
      {...stylex.props(styles.tile)}
    >
      <Cover src={hit.coverUrl} sx={styles.cover} />
      <span sx={styles.caption}>
        <span sx={styles.flag}>
          <CountryFlag country={hit.countryOfOrigin} />
        </span>
        <span sx={styles.title}>{title}</span>
      </span>
    </Link>
  )
}

export function ResultTileSkeleton() {
  return <CoverSkeleton sx={styles.cover} />
}
