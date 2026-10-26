import * as stylex from "@stylexjs/stylex"
import { colors, font, motion, radius, shadows } from "@taiyomoe/ui/styles/tokens.stylex"

const WIDE = "@media (width >= 72rem)"
const styles = stylex.create({
  volumeItem: {
    flexShrink: 0,
  },
  volume: {
    borderRadius: `calc(${radius.xl} - 0.375rem)`,
    borderWidth: 0,
    paddingBlock: "0.625rem",
    paddingInline: "0.875rem",
    alignItems: "center",
    backgroundColor: {
      default: "transparent",
      ":is([aria-current=true])": colors.wellRaised,
      ":hover": colors.chipHover,
    },
    boxShadow: { default: "none", ":is([aria-current=true])": shadows.raised },
    color: colors.foreground,
    columnGap: "0.75rem",
    cursor: "pointer",
    display: "grid",
    flexShrink: 0,
    gridTemplateColumns: "minmax(0, 1fr) auto",
    outlineColor: colors.ring,
    outlineOffset: -2,
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: 2,
    textAlign: "start",
    transitionDuration: "150ms",
    transitionProperty: "background-color, box-shadow",
    transitionTimingFunction: motion.easeOut,
    width: { [WIDE]: "100%", default: "auto" },
  },
  volumeName: {
    overflow: "hidden",
    fontSize: "0.9375rem",
    fontWeight: 600,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    maxWidth: { [WIDE]: null, default: "14rem" },
  },
  volumeNameActive: {
    color: colors.primary,
  },
  volumeRange: {
    color: colors.mutedForeground,
    fontFamily: font.mono,
    fontSize: "0.75rem",
    gridColumnStart: 1,
    whiteSpace: "nowrap",
  },
  volumeCount: {
    color: colors.mutedForeground,
    fontFamily: font.mono,
    fontSize: "0.75rem",
    gridColumnStart: 2,
    gridRowEnd: 3,
    gridRowStart: 1,
  },
})

type VolumeItemProps = {
  name: string
  range: string | null
  count: number
  active: boolean
  onClick: () => void
}

export function VolumeItem({ name, range: chapters, count, active, onClick }: VolumeItemProps) {
  return (
    <li sx={styles.volumeItem}>
      <button aria-current={active} onClick={onClick} sx={styles.volume} type="button">
        <span sx={[styles.volumeName, active && styles.volumeNameActive]} title={name}>
          {name}
        </span>
        <span sx={styles.volumeCount}>{count}</span>
        {chapters === null ? null : <span sx={styles.volumeRange}>{chapters}</span>}
      </button>
    </li>
  )
}
