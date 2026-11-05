import type { ComponentProps, ReactElement } from "react"
import * as stylex from "@stylexjs/stylex"
import { DiscordLogo } from "@taiyomoe/ui/components/logos/discord-logo"
import { GoogleLogo } from "@taiyomoe/ui/components/logos/google-logo"
import { Badge } from "@taiyomoe/ui/components/ui/badge"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { useQuery } from "@tanstack/react-query"
import { ErrorAlert } from "@/components/feedback/error-alert"
import { TimeAgo } from "@/components/time/time-ago"
import {
  myAccountsQueryOptions,
  useLinkAccount,
  useUnlinkAccount,
} from "@/features/settings/api/account"
import { SettingsSection } from "@/features/settings/components/settings-section"
import { settingsStyles } from "@/features/settings/components/settings-styles"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

const PROVIDERS = [
  { id: "discord", label: m.global_discord, logo: DiscordLogo },
  { id: "google", label: m.global_google, logo: GoogleLogo },
] as const satisfies Array<{
  id: string
  label: () => string
  logo: (props: ComponentProps<"svg">) => ReactElement
}>
const styles = stylex.create({
  logo: {
    flexShrink: 0,
    height: "1.5rem",
    width: "1.5rem",
  },
  skeleton: {
    borderRadius: radius.xl,
    height: "4rem",
  },
})

export function ConnectedAccountsSection() {
  const accounts = useQuery(myAccountsQueryOptions)
  const link = useLinkAccount()
  const unlink = useUnlinkAccount()
  const total = accounts.data?.length ?? 0
  const error = accounts.error ?? link.error ?? unlink.error

  return (
    <SettingsSection
      description={m.user_settings_connections_description()}
      title={m.user_settings_connections_title()}
    >
      <div sx={settingsStyles.form}>
        <ErrorAlert message={error === null ? null : getErrorMessage(error)} />
        <ul sx={settingsStyles.list}>
          {PROVIDERS.map(({ id, label, logo: Logo }) => {
            const account = accounts.data?.find((candidate) => candidate.providerId === id)

            if (accounts.data === undefined) {
              return (
                <li key={id}>
                  <Skeleton sx={styles.skeleton} />
                </li>
              )
            }

            return (
              <li key={id} sx={settingsStyles.item}>
                <Logo {...stylex.props(styles.logo)} />
                <div sx={settingsStyles.itemMain}>
                  <span sx={settingsStyles.itemTitle}>
                    {label()}
                    {account === undefined ? null : (
                      <Badge variant="success">{m.user_settings_connected()}</Badge>
                    )}
                  </span>
                  <span sx={settingsStyles.itemMeta}>
                    {account === undefined ? (
                      m.user_settings_connect_hint({ provider: label() })
                    ) : (
                      <span>
                        {m.user_settings_connected_since()}{" "}
                        <TimeAgo date={new Date(account.createdAt).toISOString()} />
                      </span>
                    )}
                  </span>
                </div>
                {account === undefined ? (
                  <Button
                    loading={link.isPending && link.variables === id}
                    onClick={() => {
                      link.mutate(id)
                    }}
                    size="sm"
                    variant="outline"
                  >
                    {m.user_settings_connect()}
                  </Button>
                ) : (
                  <Button
                    disabled={total <= 1}
                    loading={unlink.isPending && unlink.variables.providerId === id}
                    onClick={() => {
                      unlink.mutate({ providerId: id, accountId: account.accountId })
                    }}
                    size="sm"
                    title={total <= 1 ? m.user_settings_disconnect_last() : undefined}
                    variant="ghost"
                  >
                    {m.user_settings_disconnect()}
                  </Button>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </SettingsSection>
  )
}
