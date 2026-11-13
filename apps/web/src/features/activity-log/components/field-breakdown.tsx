import * as stylex from "@stylexjs/stylex"
import { Card } from "@taiyomoe/ui/components/ui/card"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { colors, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import type { AuditLogFacets } from "@/features/activity-log/api/audit-logs"
import type { FacetKey } from "@/features/activity-log/components/breakdown/types"
import { sceneFont } from "@/components/scene/scene.stylex"
import { FacetList } from "@/features/activity-log/components/breakdown/facet-list"
import { formatCount } from "@/features/activity-log/lib/format"
import { m } from "@/paraglide/messages"

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
    padding: "1.5rem",
    gap: "1.5rem",
    minWidth: 0,
  },
  title: {
    margin: 0,
    fontFamily: sceneFont.display,
    fontSize: "1.375rem",
    fontWeight: 700,
    letterSpacing: "-0.01em",
    lineHeight: 1.2,
  },
  subtitle: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
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
  skeleton: {
    borderRadius: radius.md,
    height: "1.75rem",
  },
})

export function FieldBreakdown({
  facets,
  blocked,
  onFilter,
}: {
  facets: AuditLogFacets | undefined
  blocked: boolean
  onFilter: (field: string, value: string, negate: boolean) => void
}) {
  let subtitle = m.activity_breakdown_loading()

  if (blocked) {
    subtitle = m.activity_fix_query()
  } else if (facets !== undefined) {
    subtitle =
      facets.total === 0
        ? m.activity_breakdown_none()
        : m.activity_breakdown_subtitle({ count: formatCount(facets.total) })
  }

  return (
    <Card render={<aside />} sx={styles.card}>
      <div>
        <h2 sx={styles.title}>{m.activity_breakdown_title()}</h2>
        <p sx={styles.subtitle}>{subtitle}</p>
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
