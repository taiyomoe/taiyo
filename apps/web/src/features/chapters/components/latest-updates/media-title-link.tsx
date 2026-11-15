import type { Sx } from "@taiyomoe/ui/styles/sx"
import * as stylex from "@stylexjs/stylex"
import { colors, font, motion } from "@taiyomoe/ui/styles/tokens.stylex"
import { Link } from "@tanstack/react-router"
import type { LatestChapter } from "@/features/chapters/api/chapters"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  title: {
    overflow: "hidden",
    color: {
      default: colors.foreground,
      ":hover": `color-mix(in srgb, ${colors.foreground} 75%, ${colors.background})`,
    },
    flexShrink: 1,
    fontFamily: font.heading,
    fontSize: "0.9375rem",
    fontWeight: font.weightBold,
    letterSpacing: "-0.01em",
    outlineColor: colors.ring,
    outlineOffset: 2,
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: 2,
    textDecorationLine: "none",
    textOverflow: "ellipsis",
    transitionDuration: "200ms",
    transitionProperty: "color",
    transitionTimingFunction: motion.easeOut,
    whiteSpace: "nowrap",
    minWidth: "3rem",
  },
  untitled: {
    color: colors.mutedForeground,
    fontStyle: "italic",
    fontWeight: 500,
    paddingRight: "0.125em",
  },
})

export function MediaTitleLink({ chapter, sx }: { chapter: LatestChapter; sx?: Sx }) {
  return (
    <Link
      params={{ mediaId: chapter.mediaId }}
      to="/media/$mediaId"
      {...stylex.props(styles.title, sx)}
    >
      {chapter.mediaTitle ?? <span sx={styles.untitled}>{m.media_untitled()}</span>}
    </Link>
  )
}
