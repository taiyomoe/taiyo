import * as stylex from "@stylexjs/stylex"
import { FilterIn, FilterOut } from "@taiyomoe/ui/components/icons"
import { colors, font, motion, radius, shadows } from "@taiyomoe/ui/styles/tokens.stylex"
import type { FacetKey, FacetValue } from "@/features/activity-log/components/breakdown/types"
import { UserName } from "@/components/user-name/user-name"
import { ActorGlyph } from "@/features/activity-log/components/breakdown/actor-glyph"
import { getCategoryTone } from "@/features/activity-log/components/entity-avatar"
import { formatCount } from "@/features/activity-log/lib/format"
import { OUTCOME_TONES } from "@/features/activity-log/lib/outcomes"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  row: {
    borderRadius: radius.md,
    gap: "0.25rem",
    alignItems: "center",
    backgroundColor: {
      default: "transparent",
      ":hover": colors.accent,
    },
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) auto auto",
    paddingInlineStart: "0.5rem",
    position: "relative",
  },
  main: {
    borderWidth: 0,
    gap: "0.25rem",
    paddingBlock: "0.4375rem",
    backgroundColor: "transparent",
    color: colors.foreground,
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    textAlign: "start",
    minWidth: 0,
  },
  label: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
    fontSize: "0.8125rem",
    minWidth: 0,
  },
  value: {
    overflow: "hidden",
    fontFamily: font.mono,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  count: {
    color: colors.mutedForeground,
    fontFamily: font.mono,
    fontSize: "0.75rem",
    fontVariantNumeric: "tabular-nums",
    marginInlineStart: "auto",
    paddingInlineStart: "0.5rem",
  },
  rail: {
    borderRadius: radius.full,
    overflow: "hidden",
    backgroundColor: colors.well,
    boxShadow: shadows.sunken,
    display: "block",
    height: "0.25rem",
  },
  fill: (share: string, color: string) => ({
    borderRadius: radius.full,
    backgroundColor: color,
    display: "block",
    height: "100%",
    width: share,
  }),
  action: {
    borderRadius: radius.md,
    borderWidth: 0,
    alignItems: "center",
    backgroundColor: {
      default: "transparent",
      ":hover": colors.chipHover,
    },
    color: colors.mutedForeground,
    cursor: "pointer",
    display: "inline-flex",
    justifyContent: "center",
    opacity: {
      default: 0,
      [stylex.when.ancestor(":focus-within")]: 1,
      [stylex.when.ancestor(":hover")]: 1,
      ":focus-visible": 1,
    },
    transitionDuration: motion.enter,
    transitionProperty: "opacity",
    height: "1.75rem",
    width: "1.75rem",
  },
})

export function FacetRow({
  facetKey,
  field,
  entry,
  total,
  onFilter,
}: {
  facetKey: FacetKey
  field: string
  entry: FacetValue
  total: number
  onFilter: (field: string, value: string, negate: boolean) => void
}) {
  const share = total === 0 ? 0 : entry.count / total
  const label = entry.displayName ?? entry.value
  const { value } = entry
  let tone: string =
    facetKey === "severity" && (value === "high" || value === "critical")
      ? colors.destructive
      : colors.primary

  if (
    facetKey === "outcome" &&
    (value === "success" || value === "failure" || value === "denied")
  ) {
    tone = OUTCOME_TONES[value]
  } else if (facetKey === "category") {
    tone = getCategoryTone(value)
  }

  return (
    <li sx={[styles.row, stylex.defaultMarker()]}>
      <button
        onClick={() => {
          onFilter(field, entry.value, false)
        }}
        sx={styles.main}
        title={m.activity_filter_for({ value: label })}
        type="button"
      >
        <span sx={styles.label}>
          {facetKey === "actor" ? <ActorGlyph entry={entry} /> : null}
          <span sx={styles.value}>
            <UserName effect={entry.nameEffect} name={label} />
          </span>
          <span sx={styles.count}>{formatCount(entry.count)}</span>
        </span>
        <span aria-hidden sx={styles.rail}>
          <span sx={styles.fill(`${Math.max(share * 100, 2)}%`, tone)} />
        </span>
      </button>
      <button
        aria-label={m.activity_filter_for({ value: label })}
        onClick={() => {
          onFilter(field, entry.value, false)
        }}
        sx={styles.action}
        type="button"
      >
        <FilterIn size={15} />
      </button>
      <button
        aria-label={m.activity_filter_out({ value: label })}
        onClick={() => {
          onFilter(field, entry.value, true)
        }}
        sx={styles.action}
        type="button"
      >
        <FilterOut size={15} />
      </button>
    </li>
  )
}
