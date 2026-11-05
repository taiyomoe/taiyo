// oxlint-disable-next-line no-unused-vars
import * as stylex from "@stylexjs/stylex"
import { Monitor } from "@taiyomoe/ui/components/icons"
import { Badge } from "@taiyomoe/ui/components/ui/badge"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { useQuery } from "@tanstack/react-query"
import { ErrorAlert } from "@/components/feedback/error-alert"
import { TimeAgo } from "@/components/time/time-ago"
import { mySessionsQueryOptions, useRevokeSessions } from "@/features/settings/api/account"
import { SettingsSection } from "@/features/settings/components/settings-section"
import { settingsStyles } from "@/features/settings/components/settings-styles"
import { describeUserAgent } from "@/features/users/lib/user-agent"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

const iso = (value: string | Date) => new Date(value).toISOString()

export function SessionsSection({ currentToken }: { currentToken: string }) {
  const sessions = useQuery(mySessionsQueryOptions)
  const revoke = useRevokeSessions()
  const list = [...(sessions.data ?? [])].sort(
    (a, b) =>
      Number(b.token === currentToken) - Number(a.token === currentToken) ||
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  )
  const others = list.filter((session) => session.token !== currentToken).length
  const error = sessions.error ?? revoke.error

  return (
    <SettingsSection
      description={m.user_settings_sessions_description()}
      footer={
        <div sx={settingsStyles.actions}>
          <Button
            disabled={others === 0}
            loading={revoke.isPending && revoke.variables === null}
            onClick={() => {
              revoke.mutate(null)
            }}
            variant="outline"
          >
            {m.user_settings_sessions_revoke_others()}
          </Button>
        </div>
      }
      title={m.user_settings_sessions_title()}
    >
      <div sx={settingsStyles.form}>
        <ErrorAlert message={error === null ? null : getErrorMessage(error)} />
        {sessions.data === undefined ? (
          <Skeleton sx={settingsStyles.itemSkeleton} />
        ) : (
          <ul sx={settingsStyles.list}>
            {list.map((session) => {
              const device = describeUserAgent(session.userAgent)
              const current = session.token === currentToken

              return (
                <li key={session.id} sx={settingsStyles.item}>
                  <Monitor size={20} sx={settingsStyles.itemIcon} />
                  <div sx={settingsStyles.itemMain}>
                    <span sx={settingsStyles.itemTitle}>
                      {device === null ? m.sessions_unknown_device() : m.sessions_device(device)}
                      {current ? (
                        <Badge variant="success">{m.user_settings_sessions_current()}</Badge>
                      ) : null}
                    </span>
                    <span sx={settingsStyles.itemMeta}>
                      {session.ipAddress === null || session.ipAddress === undefined ? null : (
                        <span>{session.ipAddress}</span>
                      )}
                      <span>
                        {m.sessions_signed_in()} <TimeAgo date={iso(session.createdAt)} />
                      </span>
                      <span>
                        {m.user_settings_sessions_active()}{" "}
                        <TimeAgo date={iso(session.updatedAt)} />
                      </span>
                    </span>
                  </div>
                  {current ? null : (
                    <Button
                      loading={revoke.isPending && revoke.variables === session.token}
                      onClick={() => {
                        revoke.mutate(session.token)
                      }}
                      size="sm"
                      variant="outline"
                    >
                      {m.sessions_revoke()}
                    </Button>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </SettingsSection>
  )
}
