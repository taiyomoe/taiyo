import type { IconProps } from "@taiyomoe/ui/components/icons"
import type { LinkProps } from "@tanstack/react-router"
import type { ReactElement } from "react"
import * as stylex from "@stylexjs/stylex"
import { AlertTriangle } from "@taiyomoe/ui/components/icons"
import { colors, font, radius, shadows } from "@taiyomoe/ui/styles/tokens.stylex"
import { useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import type { DashboardOverview } from "@/features/dashboard/api/overview"
import { myOverviewQueryOptions } from "@/features/dashboard/api/my-overview"
import { getVisibleQueues } from "@/features/dashboard/lib/dashboard-queues"
import { formatNumber } from "@/features/dashboard/lib/format"
import { m } from "@/paraglide/messages"

type AttentionItem = {
  key: string
  label: () => string
  icon: (props: IconProps) => ReactElement
  count: number
  to?: NonNullable<LinkProps["to"]>
}
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
    textDecoration: "none",
    alignItems: "center",
    backgroundColor: colors.well,
    color: "inherit",
    display: "flex",
    paddingInlineEnd: "1.125rem",
    paddingInlineStart: "0.75rem",
  },
  rowLink: {
    backgroundColor: { default: colors.well, ":hover": colors.wellRaised },
    transitionDuration: "150ms",
    transitionProperty: "background-color",
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
  const { data: mine } = useQuery(myOverviewQueryOptions)
  const items: AttentionItem[] = [
    ...getVisibleQueues(mine?.queues),
    {
      key: "failedUploads",
      label: m.dashboard_attention_failed_uploads,
      icon: AlertTriangle,
      count: attention.failedUploads,
    },
  ]

  return (
    <ul sx={styles.list}>
      {items.map(({ key, label, icon: Icon, count, to }) => {
        const content = (
          <>
            <span sx={[styles.chip, count === 0 && styles.chipIdle]}>
              <Icon size={18} />
            </span>
            <span sx={styles.label}>{label()}</span>
            <span sx={[styles.count, count === 0 && styles.countIdle]}>{formatNumber(count)}</span>
          </>
        )

        return (
          <li key={key}>
            {to === undefined ? (
              <div sx={styles.row}>{content}</div>
            ) : (
              <Link to={to} {...stylex.props(styles.row, styles.rowLink)}>
                {content}
              </Link>
            )}
          </li>
        )
      })}
    </ul>
  )
}
