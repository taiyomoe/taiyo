import * as stylex from "@stylexjs/stylex"
import { Robot, User } from "@taiyomoe/ui/components/icons"
import { colors, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import type { AuditLogEntry } from "@/features/activity-log/api/audit-logs"
import { avatarStyles } from "@/features/activity-log/components/avatars/avatar-styles"
import { PersonAvatar } from "@/features/activity-log/components/avatars/person-avatar"

const styles = stylex.create({
  glyph: (color: string) => ({
    borderRadius: radius.full,
    alignItems: "center",
    backgroundColor: `color-mix(in srgb, ${color} 18%, transparent)`,
    color,
    display: "inline-flex",
    flexShrink: 0,
    justifyContent: "center",
  }),
})

export function ActorAvatar({
  actor,
  size = "2rem",
}: {
  actor: AuditLogEntry["actor"]
  size?: string
}) {
  if (actor.type !== "user") {
    return (
      <span aria-hidden sx={[styles.glyph(colors.chart3), avatarStyles.size(size)]}>
        <Robot size={16} />
      </span>
    )
  }

  if (actor.id === "anonymous") {
    return (
      <span aria-hidden sx={[styles.glyph(colors.mutedForeground), avatarStyles.size(size)]}>
        <User size={16} />
      </span>
    )
  }

  return (
    <PersonAvatar
      border={actor.user?.avatarBorder}
      image={actor.user?.image ?? null}
      name={actor.user?.displayUsername ?? actor.displayName ?? actor.id}
      seed={actor.id}
      size={size}
    />
  )
}
