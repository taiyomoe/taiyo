import * as stylex from "@stylexjs/stylex"
import { colors, font } from "@taiyomoe/ui/styles/tokens.stylex"
import { CHANGELOG_TAGS, type ChangelogTag as Tag } from "@/features/changelog/lib/changelog"

const styles = stylex.create({
  tag: {
    borderColor: `color-mix(in srgb, ${colors.foreground} 14%, ${colors.background})`,
    borderRadius: "9999px",
    borderStyle: "solid",
    borderWidth: "1px",
    gap: "0.375rem",
    paddingInline: "0.5rem",
    alignItems: "center",
    backgroundColor: colors.background,
    color: colors.foreground,
    display: "inline-flex",
    fontFamily: font.sans,
    fontSize: "0.8125rem",
    fontWeight: 500,
    lineHeight: 1,
    verticalAlign: "0.0625rem",
    whiteSpace: "nowrap",
    height: "1.5625rem",
  },
  dot: {
    borderRadius: "9999px",
    flexShrink: 0,
    height: "0.5625rem",
    width: "0.5625rem",
  },
})
const dots = stylex.create({
  brand: { backgroundColor: colors.chart1 },
  emerald: { backgroundColor: colors.chart2 },
  violet: { backgroundColor: colors.chart3 },
  pink: { backgroundColor: colors.chart4 },
  amber: { backgroundColor: colors.chart5 },
  gray: { backgroundColor: colors.mutedForeground },
})

export const ChangelogTag = ({ tag }: { tag: Tag }) => (
  <span sx={styles.tag}>
    <span sx={[styles.dot, dots[CHANGELOG_TAGS[tag].color]]} />
    {CHANGELOG_TAGS[tag].label()}
  </span>
)
