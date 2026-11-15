import type { IconProps } from "@taiyomoe/ui/components/icons"
import type { ReactElement } from "react"
import * as stylex from "@stylexjs/stylex"
import { AlertTriangle, UserCheck } from "@taiyomoe/ui/components/icons"
import { colors, font, radius, shadows } from "@taiyomoe/ui/styles/tokens.stylex"
import type { DashboardOverview } from "@/features/dashboard/api/overview"
import { formatNumber } from "@/features/dashboard/lib/format"
import { m } from "@/paraglide/messages"

const ITEMS: ReadonlyArray<{
  key: keyof DashboardOverview["attention"]
  label: () => string
  icon: (props: IconProps) => ReactElement
}> = [
  {
    key: "pendingOwnershipRequests",
    label: m.dashboard_attention_ownership_requests,
    icon: UserCheck,
  },
  { key: "failedUploads", label: m.dashboard_attention_failed_uploads, icon: AlertTriangle },
]
const styles = stylex.create({
  list: {
    margin: 0,
    padding: 0,
    gap: "0.625rem",
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
  },
  row: {
    borderColor: colors.border,
    borderRadius: radius.xl,
    borderStyle: "solid",
    borderWidth: 1,
    gap: "0.875rem",
    paddingBlock: "0.75rem",
    alignItems: "center",
    backgroundColor: colors.well,
    display: "flex",
    paddingInlineEnd: "1.125rem",
    paddingInlineStart: "0.75rem",
  },
  chip: {
    borderRadius: radius.full,
    alignItems: "center",
    backgroundColor: colors.wellRaised,
    boxShadow: shadows.chip,
    color: colors.primary,
    display: "flex",
    flexShrink: 0,
    justifyContent: "center",
    height: "2.5rem",
    width: "2.5rem",
  },
  chipIdle: {
    color: colors.mutedForeground,
  },
  label: {
    flex: "1",
    fontSize: "0.9375rem",
    fontWeight: 600,
    lineHeight: "1.25rem",
  },
  count: {
    fontFamily: font.mono,
    fontSize: "1rem",
    fontVariantNumeric: "tabular-nums",
    fontWeight: 600,
  },
  countIdle: {
    color: colors.mutedForeground,
  },
})

export function AttentionList({ overview: { attention } }: { overview: DashboardOverview }) {
  return (
    <ul sx={styles.list}>
      {ITEMS.map(({ key, label, icon: Icon }) => (
        <li key={key} sx={styles.row}>
          <span sx={[styles.chip, attention[key] === 0 && styles.chipIdle]}>
            <Icon size={18} />
          </span>
          <span sx={styles.label}>{label()}</span>
          <span sx={[styles.count, attention[key] === 0 && styles.countIdle]}>
            {formatNumber(attention[key])}
          </span>
        </li>
      ))}
    </ul>
  )
}
