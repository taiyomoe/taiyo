import * as stylex from "@stylexjs/stylex"
import { Badge } from "@taiyomoe/ui/components/ui/badge"
import { breakpoints, colors, font } from "@taiyomoe/ui/styles/tokens.stylex"
import type { Media } from "@/features/media/api/medias"
import { sceneFont } from "@/components/scene/scene.stylex"
import { mediaPageStyles } from "@/features/media/components/media-page/media-page-styles"
import {
  MEDIA_STATUS_BADGES,
  MEDIA_STATUS_LABELS,
  MEDIA_TYPE_LABELS,
  getAltTitles,
  getMainTitle,
  getMediaYears,
} from "@/features/media/lib/media-labels"
import { m } from "@/paraglide/messages"

const MAX_EYEBROW_TITLES = 3
const styles = stylex.create({
  eyebrow: {
    margin: 0,
    overflow: "hidden",
    color: `color-mix(in srgb, ${colors.foreground} 75%, transparent)`,
    display: { default: "none", [breakpoints.sm]: "block" },
    fontSize: "0.75rem",
    fontWeight: 600,
    letterSpacing: "0.12em",
    textOverflow: "ellipsis",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
  },
  title: {
    margin: 0,
    overflow: "hidden",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: { [breakpoints.lg]: 3, default: 4 },
    color: colors.foreground,
    display: "-webkit-box",
    fontFamily: sceneFont.display,
    fontSize: { default: "1.625rem", [breakpoints.sm]: "2.25rem", [breakpoints.lg]: "3.25rem" },
    fontWeight: font.weightBold,
    letterSpacing: "-0.02em",
    lineHeight: 1.1,
    overflowWrap: "anywhere",
  },
  untitled: {
    color: colors.mutedForeground,
    fontStyle: "italic",
  },
  badges: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
  },
  years: {
    fontFamily: font.mono,
  },
})

export function MediaHeader({ media }: { media: Media }) {
  const title = getMainTitle(media.titles)
  const eyebrow = getAltTitles(media.titles)
    .filter((alt) => !alt.isAcronym)
    .slice(0, MAX_EYEBROW_TITLES)
    .map((alt) => alt.title)
  const years = getMediaYears(media)

  return (
    <header sx={mediaPageStyles.header}>
      {eyebrow.length === 0 ? null : <p sx={styles.eyebrow}>{eyebrow.join(" · ")}</p>}
      <h1 sx={styles.title} title={title ?? undefined}>
        {title ?? <span sx={styles.untitled}>{m.media_untitled()}</span>}
      </h1>
      <div sx={styles.badges}>
        <Badge size="lg" variant="outline">
          {MEDIA_TYPE_LABELS[media.type]()}
        </Badge>
        <Badge size="lg" variant={MEDIA_STATUS_BADGES[media.status]}>
          {MEDIA_STATUS_LABELS[media.status]()}
        </Badge>
        {years === null ? null : (
          <Badge size="lg" sx={styles.years} variant="secondary">
            {years}
          </Badge>
        )}
      </div>
    </header>
  )
}
