import * as stylex from "@stylexjs/stylex"
import { FilterIn, FilterOut, Robot, User } from "@taiyomoe/ui/components/icons"
import { Card } from "@taiyomoe/ui/components/ui/card"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { colors, font, motion, radius, shadows } from "@taiyomoe/ui/styles/tokens.stylex"
import type { AuditLogFacets } from "@/lib/queries/audit-logs"
import { getCategoryTone, PersonAvatar } from "@/components/dashboard/activity-log/entity-avatar"
import { formatCount } from "@/components/dashboard/activity-log/format"
import { OUTCOME_TONES } from "@/components/dashboard/activity-log/log-histogram"
import { m } from "@/paraglide/messages"

type FacetKey = Exclude<keyof AuditLogFacets, "total">

type FacetValue = {
  value: string
  count: number
  type?: string
  displayName?: string | null
  image?: string | null
}

const VISIBLE = 5
const SECTIONS: ReadonlyArray<{ key: FacetKey; field: string; label: () => string }> = [
  { key: "category", field: "category", label: m.activity_breakdown_category },
  { key: "actor", field: "actor.id", label: m.activity_breakdown_actor },
  { key: "outcome", field: "outcome", label: m.activity_breakdown_outcome },
  { key: "severity", field: "severity", label: m.activity_breakdown_severity },
  { key: "action", field: "action", label: m.activity_breakdown_action },
  { key: "targetType", field: "target.type", label: m.activity_breakdown_target_type },
  { key: "ip", field: "ip", label: m.activity_breakdown_ip },
]
const styles = stylex.create({
  card: {
    padding: "1.25rem",
    gap: "1.5rem",
    minWidth: 0,
  },
  title: {
    margin: 0,
    fontSize: "1.0625rem",
    fontWeight: 700,
  },
  subtitle: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: "0.8125rem",
    marginTop: "0.25rem",
  },
  section: {
    gap: "0.375rem",
    display: "flex",
    flexDirection: "column",
  },
  sectionTitle: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: "0.6875rem",
    fontWeight: 700,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  },
  list: {
    margin: 0,
    padding: 0,
    gap: "0.125rem",
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
  },
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

  glyph: {
    color: colors.mutedForeground,
    flexShrink: 0,
  },
  empty: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: "0.8125rem",
  },
  skeleton: {
    borderRadius: radius.md,
    height: "1.75rem",
  },
})
const toneFor = (key: FacetKey, value: string) => {
  if (key === "outcome" && (value === "success" || value === "failure" || value === "denied")) {
    return OUTCOME_TONES[value]
  }

  if (key === "category") {
    return getCategoryTone(value)
  }

  return key === "severity" && (value === "high" || value === "critical")
    ? colors.destructive
    : colors.primary
}
const getSubtitle = (facets: AuditLogFacets | undefined, blocked: boolean) => {
  if (blocked) {
    return m.activity_fix_query()
  }

  if (facets === undefined) {
    return m.activity_breakdown_loading()
  }

  return facets.total === 0
    ? m.activity_breakdown_none()
    : m.activity_breakdown_subtitle({ count: formatCount(facets.total) })
}

type FieldBreakdownProps = {
  facets: AuditLogFacets | undefined
  blocked: boolean
  onFilter: (field: string, value: string, negate: boolean) => void
}

export function FieldBreakdown({ facets, blocked, onFilter }: FieldBreakdownProps) {
  return (
    <Card render={<aside />} sx={styles.card}>
      <div>
        <h2 sx={styles.title}>{m.activity_breakdown_title()}</h2>
        <p sx={styles.subtitle}>{getSubtitle(facets, blocked)}</p>
      </div>
      {blocked || facets?.total === 0
        ? null
        : SECTIONS.map(({ key, field, label }) => (
            <section key={key} sx={styles.section}>
              <h3 sx={styles.sectionTitle}>{label()}</h3>
              {facets === undefined ? (
                <Skeleton sx={styles.skeleton} />
              ) : (
                <FacetList
                  facetKey={key}
                  field={field}
                  onFilter={onFilter}
                  total={facets.total}
                  values={facets[key]}
                />
              )}
            </section>
          ))}
    </Card>
  )
}

function FacetList({
  facetKey,
  field,
  values,
  total,
  onFilter,
}: {
  facetKey: FacetKey
  field: string
  values: readonly FacetValue[]
  total: number
  onFilter: FieldBreakdownProps["onFilter"]
}) {
  if (values.length === 0) {
    return <p sx={styles.empty}>{m.activity_breakdown_empty()}</p>
  }

  return (
    <ul sx={styles.list}>
      {values.slice(0, VISIBLE).map((entry) => {
        const share = total === 0 ? 0 : entry.count / total
        const label = entry.displayName ?? entry.value

        return (
          <li key={entry.value} sx={[styles.row, stylex.defaultMarker()]}>
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
                <span sx={styles.value}>{label}</span>
                <span sx={styles.count}>{formatCount(entry.count)}</span>
              </span>
              <span aria-hidden sx={styles.rail}>
                <span
                  sx={styles.fill(`${Math.max(share * 100, 2)}%`, toneFor(facetKey, entry.value))}
                />
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
      })}
    </ul>
  )
}

function ActorGlyph({ entry }: { entry: FacetValue }) {
  if (entry.type !== "user" || entry.value === "anonymous") {
    const Glyph = entry.type === "user" ? User : Robot

    return <Glyph {...stylex.props(styles.glyph)} size={16} />
  }

  return (
    <PersonAvatar
      image={entry.image ?? null}
      name={entry.displayName ?? entry.value}
      seed={entry.value}
      size="1.25rem"
    />
  )
}
