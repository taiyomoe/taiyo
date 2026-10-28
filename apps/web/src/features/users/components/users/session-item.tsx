import type { dataTagSymbol } from "@tanstack/react-query"
import * as stylex from "@stylexjs/stylex"
import { Monitor } from "@taiyomoe/ui/components/icons"
import { Badge } from "@taiyomoe/ui/components/ui/badge"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { colors, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import type { userSessionsQueryOptions } from "@/features/users/api/user-admin"
import { TimeAgo } from "@/components/time/time-ago"
import { describeUserAgent } from "@/features/users/lib/user-agent"
import { m } from "@/paraglide/messages"

type UserSession = ReturnType<
  typeof userSessionsQueryOptions
>["queryKey"][typeof dataTagSymbol][number]

const styles = stylex.create({
  session: {
    padding: "0.75rem",
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderStyle: "solid",
    borderWidth: 1,
    gap: "0.75rem",
    alignItems: "center",
    display: "flex",
  },
  sessionIcon: {
    color: colors.mutedForeground,
    flexShrink: 0,
  },
  sessionMain: {
    gap: "0.25rem",
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    minWidth: 0,
  },
  sessionTitle: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
    fontWeight: 600,
  },
  sessionMeta: {
    gap: "0.75rem",
    color: colors.mutedForeground,
    display: "flex",
    flexWrap: "wrap",
    fontSize: "0.8125rem",
  },
})
const iso = (value: string | Date) => new Date(value).toISOString()

export function SessionItem({
  session,
  revoking,
  onRevoke,
}: {
  session: UserSession
  revoking: boolean
  onRevoke: () => void
}) {
  const device = describeUserAgent(session.userAgent)

  return (
    <li sx={styles.session}>
      <Monitor size={20} {...stylex.props(styles.sessionIcon)} />
      <div sx={styles.sessionMain}>
        <span sx={styles.sessionTitle}>
          {device === null ? m.sessions_unknown_device() : m.sessions_device(device)}
          {typeof session.impersonatedBy === "string" ? (
            <Badge variant="warning">{m.sessions_impersonation()}</Badge>
          ) : null}
        </span>
        <span sx={styles.sessionMeta}>
          {session.ipAddress === null || session.ipAddress === undefined ? null : (
            <span>{session.ipAddress}</span>
          )}
          <span>
            {m.sessions_signed_in()} <TimeAgo date={iso(session.createdAt)} />
          </span>
          <span>
            {m.sessions_expires()} <TimeAgo date={iso(session.expiresAt)} future />
          </span>
        </span>
      </div>
      <Button disabled={revoking} onClick={onRevoke} size="sm" variant="outline">
        {m.sessions_revoke()}
      </Button>
    </li>
  )
}
