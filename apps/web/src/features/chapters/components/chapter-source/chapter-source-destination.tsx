import * as stylex from "@stylexjs/stylex"
import { Globe } from "@taiyomoe/ui/components/icons"
import { colors, font, radius, shadows } from "@taiyomoe/ui/styles/tokens.stylex"
import { hostOf } from "@/features/uploads/lib/chapter-batch/links"

const styles = stylex.create({
  destination: {
    padding: "0.875rem",
    borderRadius: radius.md,
    gap: "0.75rem",
    alignItems: "center",
    backgroundColor: colors.well,
    boxShadow: shadows.sunken,
    display: "flex",
    minWidth: 0,
  },
  destinationIcon: {
    color: colors.mutedForeground,
    flexShrink: 0,
  },
  destinationText: {
    gap: "0.125rem",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  host: {
    color: colors.foreground,
    fontWeight: 600,
    overflowWrap: "anywhere",
  },
  url: {
    overflow: "hidden",
    color: colors.mutedForeground,
    fontFamily: font.mono,
    fontSize: "0.75rem",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
})

export function ChapterSourceDestination({ url }: { url: string }) {
  return (
    <div sx={styles.destination}>
      <Globe size={20} {...stylex.props(styles.destinationIcon)} />
      <div sx={styles.destinationText}>
        <span sx={styles.host}>{hostOf(url)}</span>
        <span sx={styles.url} title={url}>
          {url}
        </span>
      </div>
    </div>
  )
}
