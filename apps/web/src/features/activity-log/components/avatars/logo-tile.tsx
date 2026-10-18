// StyleX only compiles the `sx` props of files that import it.
// oxlint-disable-next-line no-unused-vars
import * as stylex from "@stylexjs/stylex"
import { useState } from "react"
import type { AuditLogEntry } from "@/features/activity-log/api/audit-logs"
import { avatarStyles } from "@/features/activity-log/components/avatars/avatar-styles"
import { getTone, initialOf } from "@/features/activity-log/lib/avatar-tones"

export function LogoTile({
  preview,
  size,
}: {
  preview: NonNullable<AuditLogEntry["preview"]>
  size: string
}) {
  const [failed, setFailed] = useState(false)
  const tone = getTone(preview.id)

  return (
    <span aria-hidden sx={[avatarStyles.tile(tone), avatarStyles.size(size)]}>
      {preview.image === null || failed ? (
        initialOf(preview.label ?? "?")
      ) : (
        <img
          alt=""
          loading="lazy"
          onError={() => {
            setFailed(true)
          }}
          src={preview.image}
          sx={avatarStyles.image}
        />
      )}
    </span>
  )
}
