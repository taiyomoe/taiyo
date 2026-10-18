import * as stylex from "@stylexjs/stylex"
import type { AuditLogEntry } from "@/features/activity-log/api/audit-logs"
import { ActorAvatar } from "@/features/activity-log/components/entity-avatar"
import { tableStyles } from "@/features/activity-log/components/table/table-styles"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  actor: {
    gap: "0.625rem",
    alignItems: "center",
    display: "flex",
    minWidth: 0,
  },
  actorText: {
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
})

export function ActorCell({ entry: { actor, context } }: { entry: AuditLogEntry }) {
  const name =
    actor.id === "anonymous"
      ? m.activity_anonymous()
      : (actor.user?.displayUsername ?? actor.displayName ?? actor.id)
  let detail = actor.type === "user" ? (context.ip ?? actor.type) : actor.type

  if (actor.user !== null) {
    detail = `@${actor.user.username}`
  }

  if (actor.impersonating !== null) {
    detail = m.activity_impersonating()
  }

  return (
    <div sx={styles.actor}>
      <ActorAvatar actor={actor} />
      <span sx={styles.actorText}>
        <span sx={tableStyles.ellipsis}>{name}</span>
        <span sx={[tableStyles.muted, tableStyles.ellipsis]}>{detail}</span>
      </span>
    </div>
  )
}
