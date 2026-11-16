import type { Role } from "@taiyomoe/permissions"
import * as stylex from "@stylexjs/stylex"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { createElement } from "react"
import { ROLE_OPTIONS } from "@/features/users/lib/role-labels"

const styles = stylex.create({
  badge: {
    borderRadius: "999px",
    borderStyle: "solid",
    borderWidth: 1,
    gap: "0.375rem",
    alignItems: "center",
    display: "inline-flex",
    flexShrink: 0,
    fontSize: "0.75rem",
    fontWeight: 600,
    lineHeight: 1,
    paddingInlineEnd: "0.625rem",
    paddingInlineStart: "0.5rem",
    whiteSpace: "nowrap",
    height: "1.375rem",
    maxWidth: "100%",
  },
  icon: {
    flexShrink: 0,
    height: "0.875rem",
    width: "0.875rem",
  },
  label: {
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
})
// Each staff role gets a tint of its own, so they stand apart in a long list; readers stay neutral.
const tones = stylex.create({
  USER: {
    borderColor: colors.border,
    backgroundColor: colors.muted,
    color: colors.mutedForeground,
  },
  UPLOADER_INTERN: {
    borderColor: `color-mix(in srgb, ${colors.chart4} 28%, transparent)`,
    backgroundColor: `color-mix(in srgb, ${colors.chart4} 12%, transparent)`,
    color: `color-mix(in srgb, ${colors.chart4} 72%, ${colors.foreground})`,
  },
  UPLOADER: {
    borderColor: `color-mix(in srgb, ${colors.chart3} 28%, transparent)`,
    backgroundColor: `color-mix(in srgb, ${colors.chart3} 12%, transparent)`,
    color: `color-mix(in srgb, ${colors.chart3} 72%, ${colors.foreground})`,
  },
  MODERATOR: {
    borderColor: `color-mix(in srgb, ${colors.info} 28%, transparent)`,
    backgroundColor: `color-mix(in srgb, ${colors.info} 12%, transparent)`,
    color: `color-mix(in srgb, ${colors.info} 72%, ${colors.foreground})`,
  },
  ADMIN: {
    borderColor: `color-mix(in srgb, ${colors.warning} 32%, transparent)`,
    backgroundColor: `color-mix(in srgb, ${colors.warning} 14%, transparent)`,
    color: `color-mix(in srgb, ${colors.warning} 72%, ${colors.foreground})`,
  },
})

export function UserRoleBadge({ role }: { role: Role }) {
  return (
    <span sx={[styles.badge, tones[role]]}>
      {createElement(ROLE_OPTIONS.icon(role), {
        "aria-hidden": true,
        ...stylex.props(styles.icon),
      })}
      <span sx={styles.label}>{ROLE_OPTIONS.label(role)}</span>
    </span>
  )
}
