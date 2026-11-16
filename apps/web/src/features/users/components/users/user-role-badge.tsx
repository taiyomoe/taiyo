import type { Role } from "@taiyomoe/permissions"
import * as stylex from "@stylexjs/stylex"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { Pill } from "@/components/badges/pill"
import { ROLE_OPTIONS } from "@/features/users/lib/role-labels"

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

export function UserRoleBadge({ role, size }: { role: Role; size?: "default" | "sm" }) {
  return (
    <Pill icon={ROLE_OPTIONS.icon(role)} size={size} tone={tones[role]}>
      {ROLE_OPTIONS.label(role)}
    </Pill>
  )
}
