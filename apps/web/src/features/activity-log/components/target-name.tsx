import type { AuditLogEntry } from "@/features/activity-log/api/audit-logs"
import { UserLink } from "@/components/user-name/user-link"
import { getTargetLabel } from "@/features/activity-log/lib/activity-log"

/** The entry's target label; a user target links to their profile. */
export function TargetName({ entry }: { entry: AuditLogEntry }) {
  const { preview } = entry

  if (preview?.kind === "user" && preview.username !== null && preview.label !== null) {
    return (
      <UserLink
        user={{
          username: preview.username,
          displayUsername: preview.label,
          nameEffect: preview.nameEffect,
        }}
      />
    )
  }

  return getTargetLabel(entry)
}
