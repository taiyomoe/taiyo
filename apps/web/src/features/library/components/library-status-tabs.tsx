import * as stylex from "@stylexjs/stylex"
import { Library } from "@taiyomoe/ui/components/icons"
import { breakpoints, colors, font, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { getRouteApi, Link } from "@tanstack/react-router"
import type { LibraryCounts } from "@/features/library/api/library"
import { layout } from "@/components/layout/layout.stylex"
import {
  LIBRARY_STATUS_ICONS,
  LIBRARY_STATUS_LABELS,
  LIBRARY_STATUSES,
  libraryStatusTones,
} from "@/features/library/lib/library-statuses"
import { m } from "@/paraglide/messages"

const routeApi = getRouteApi("/library")
const styles = stylex.create({
  tabs: {
    gap: "0.375rem",
    marginInline: { default: `calc(-1 * ${layout.gutter})`, [breakpoints.md]: 0 },
    paddingInline: { default: layout.gutter, [breakpoints.md]: 0 },
    display: "flex",
    flexWrap: { default: "nowrap", [breakpoints.md]: "wrap" },
    scrollbarWidth: "none",
    overflowX: { default: "auto", [breakpoints.md]: "visible" },
  },
  tab: {
    borderColor: colors.border,
    borderRadius: radius.full,
    borderStyle: "solid",
    borderWidth: 1,
    gap: { default: "0.5rem", [breakpoints.md]: "0.4375rem" },
    textDecoration: "none",
    alignItems: "center",
    backgroundColor: { default: "transparent", ":hover": colors.accent },
    color: colors.mutedForeground,
    display: "inline-flex",
    flexShrink: 0,
    fontSize: { default: "0.875rem", [breakpoints.md]: "0.8125rem" },
    fontWeight: 550,
    outlineColor: colors.ring,
    outlineOffset: 2,
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: 2,
    paddingInlineEnd: { default: "0.625rem", [breakpoints.md]: "0.5rem" },
    paddingInlineStart: { default: "0.875rem", [breakpoints.md]: "0.75rem" },
    transitionDuration: "150ms",
    transitionProperty: "background-color, color, border-color",
    whiteSpace: "nowrap",
    height: "2.375rem",
  },
  tabActive: {
    borderColor: "transparent",
    backgroundColor: colors.card,
    boxShadow: `inset 0 1px 0 rgb(255 255 255 / 6%), 0 0 0 1px ${colors.border}`,
    color: colors.foreground,
  },
  icon: {
    flexShrink: 0,
  },
  iconIdle: {
    color: colors.mutedForeground,
  },
  count: {
    borderRadius: radius.full,
    paddingInline: "0.4375rem",
    backgroundColor: colors.well,
    color: colors.mutedForeground,
    fontFamily: font.mono,
    fontSize: "0.6875rem",
    fontVariantNumeric: "tabular-nums",
    fontWeight: 600,
    lineHeight: "1.25rem",
    textAlign: "center",
    minWidth: "1.25rem",
  },
  countActive: {
    color: colors.foreground,
  },
})

export function LibraryStatusTabs({ counts }: { counts: LibraryCounts | undefined }) {
  const search = routeApi.useSearch()

  return (
    <nav aria-label={m.library_statuses()} sx={styles.tabs}>
      {[
        { status: undefined, label: m.library_status_all(), icon: Library, count: counts?.total },
        ...LIBRARY_STATUSES.map((status) => ({
          status,
          label: LIBRARY_STATUS_LABELS[status](),
          icon: LIBRARY_STATUS_ICONS[status],
          count: counts?.byStatus[status],
        })),
      ].map(({ status, label, icon: Icon, count }) => {
        const active = search.status === status

        return (
          <Link
            aria-current={active ? "page" : undefined}
            key={status ?? "all"}
            resetScroll={false}
            search={{ ...search, status, page: undefined }}
            to="/library"
            {...stylex.props(styles.tab, active && styles.tabActive)}
          >
            <Icon
              size={17}
              {...stylex.props([
                styles.icon,
                status === undefined ? !active && styles.iconIdle : libraryStatusTones[status],
              ])}
            />
            {label}
            <span sx={[styles.count, active && styles.countActive]}>{count ?? "–"}</span>
          </Link>
        )
      })}
    </nav>
  )
}
