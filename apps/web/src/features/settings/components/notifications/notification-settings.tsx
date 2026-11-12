import * as stylex from "@stylexjs/stylex"
import { AlertCircle, Bell, Download, Info, Monitor } from "@taiyomoe/ui/components/icons"
import { Alert, AlertDescription, AlertTitle } from "@taiyomoe/ui/components/ui/alert"
import { Badge } from "@taiyomoe/ui/components/ui/badge"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { toastManager } from "@taiyomoe/ui/components/ui/toast"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { Session } from "@/lib/session"
import {
  NOTIFY_SETTINGS,
  useBooleanSettings,
} from "@/features/notifications/lib/notification-settings"
import {
  disablePush,
  enablePush,
  getPushState,
  sendTestPush,
} from "@/features/notifications/lib/push"
import { SettingSwitch } from "@/features/reader/components/sheet/setting-controls"
import { SettingsSection } from "@/features/settings/components/settings-section"
import { settingsStyles } from "@/features/settings/components/settings-styles"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

const PUSH_STATE_KEY = ["push", "state"] as const
const styles = stylex.create({
  badgeSkeleton: {
    height: "1.25rem",
    width: "3rem",
  },
})

function PushDevice() {
  const queryClient = useQueryClient()
  const state = useQuery({ queryKey: PUSH_STATE_KEY, queryFn: getPushState, staleTime: 0 })
  const onError = (error: unknown) => {
    toastManager.add({ title: getErrorMessage(error), type: "error" })
  }
  const onSettled = () => queryClient.invalidateQueries({ queryKey: PUSH_STATE_KEY })
  const enable = useMutation({ mutationFn: enablePush, onError, onSettled })
  const disable = useMutation({ mutationFn: disablePush, onError, onSettled })
  const test = useMutation({
    mutationFn: sendTestPush,
    onError,
    onSettled,
    onSuccess: () => {
      toastManager.add({ title: m.user_settings_push_test_sent(), type: "success" })
    },
  })
  const busy = enable.isPending || disable.isPending

  return (
    <SettingsSection
      action={
        state.data === undefined ? (
          <Skeleton sx={styles.badgeSkeleton} />
        ) : (
          {
            on: <Badge variant="success">{m.user_settings_push_badge_on()}</Badge>,
            off: <Badge variant="secondary">{m.user_settings_push_badge_off()}</Badge>,
            denied: <Badge variant="warning">{m.user_settings_push_badge_blocked()}</Badge>,
            "needs-install": (
              <Badge variant="secondary">{m.user_settings_push_badge_unavailable()}</Badge>
            ),
            unsupported: (
              <Badge variant="secondary">{m.user_settings_push_badge_unavailable()}</Badge>
            ),
          }[state.data]
        )
      }
      description={m.user_settings_push_device_description()}
      footer={
        state.data === "on" || state.data === "off" ? (
          <div sx={settingsStyles.actions}>
            {state.data === "on" ? (
              <>
                <Button
                  disabled={busy}
                  loading={test.isPending}
                  onClick={() => {
                    test.mutate()
                  }}
                  variant="outline"
                >
                  {m.user_settings_push_test()}
                </Button>
                <Button
                  disabled={test.isPending}
                  loading={disable.isPending}
                  onClick={() => {
                    disable.mutate()
                  }}
                  variant="destructive-outline"
                >
                  {m.user_settings_push_disable()}
                </Button>
              </>
            ) : (
              <Button
                loading={enable.isPending}
                onClick={() => {
                  enable.mutate()
                }}
              >
                <Bell />
                {m.user_settings_push_enable()}
              </Button>
            )}
          </div>
        ) : undefined
      }
      title={m.user_settings_push_device_title()}
    >
      <PushDeviceState state={state.data} />
    </SettingsSection>
  )
}

function PushDeviceState({
  state,
}: {
  state: Awaited<ReturnType<typeof getPushState>> | undefined
}) {
  if (state === undefined) {
    return <Skeleton sx={settingsStyles.itemSkeleton} />
  }

  if (state === "denied") {
    return (
      <Alert variant="warning">
        <AlertCircle />
        <AlertTitle>{m.user_settings_push_denied_title()}</AlertTitle>
        <AlertDescription>{m.user_settings_push_denied()}</AlertDescription>
      </Alert>
    )
  }

  if (state === "needs-install") {
    return (
      <Alert variant="info">
        <Download />
        <AlertTitle>{m.user_settings_push_needs_install_title()}</AlertTitle>
        <AlertDescription>{m.user_settings_push_needs_install()}</AlertDescription>
      </Alert>
    )
  }

  if (state === "unsupported") {
    return (
      <Alert variant="info">
        <Info />
        <AlertTitle>{m.user_settings_push_unsupported_title()}</AlertTitle>
        <AlertDescription>{m.user_settings_push_unsupported()}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div sx={settingsStyles.item}>
      <Monitor size={20} sx={settingsStyles.itemIcon} />
      <div sx={settingsStyles.itemMain}>
        <span sx={settingsStyles.itemTitle}>{m.user_settings_push_this_device()}</span>
        <span sx={settingsStyles.itemMeta}>
          {state === "on" ? m.user_settings_push_on() : m.user_settings_push_off()}
        </span>
      </div>
    </div>
  )
}

const PUSH_SETTINGS = [
  {
    key: "pushLibraryChapters",
    requires: "notifyChapters",
    label: m.user_settings_push_library,
    hint: m.user_settings_push_library_hint,
  },
  {
    key: "pushGroupChapters",
    requires: "notifyChapters",
    label: m.user_settings_push_groups,
    hint: m.user_settings_push_groups_hint,
  },
  {
    key: "pushReplies",
    requires: "notifyReplies",
    label: m.user_settings_push_replies,
    hint: m.user_settings_push_replies_hint,
  },
  {
    key: "pushLikes",
    requires: "notifyLikes",
    label: m.user_settings_push_likes,
    hint: m.user_settings_push_likes_hint,
  },
  {
    key: "pushFollows",
    requires: "notifyFollows",
    label: m.user_settings_push_follows,
    hint: m.user_settings_push_follows_hint,
  },
] as const

export function NotificationSettings({ user }: { user: Session["user"] }) {
  const settings = useBooleanSettings(user.settings)

  return (
    <div sx={settingsStyles.stack}>
      <SettingsSection
        description={m.user_settings_notify_description()}
        title={m.user_settings_notify_title()}
      >
        <div sx={settingsStyles.form}>
          {NOTIFY_SETTINGS.map(({ key, label, hint }) => (
            <SettingSwitch
              checked={settings.get(key)}
              hint={hint()}
              key={key}
              label={label()}
              onChange={(checked) => {
                settings.set(key, checked)
              }}
            />
          ))}
        </div>
      </SettingsSection>
      <PushDevice />
      <SettingsSection
        description={m.user_settings_push_types_description()}
        title={m.user_settings_push_types_title()}
      >
        <div sx={settingsStyles.form}>
          {PUSH_SETTINGS.map(({ key, requires, label, hint }) => {
            const allowed = settings.get(requires)

            return (
              <SettingSwitch
                checked={allowed && settings.get(key)}
                disabled={!allowed}
                hint={allowed ? hint() : m.user_settings_push_type_off()}
                key={key}
                label={label()}
                onChange={(checked) => {
                  settings.set(key, checked)
                }}
              />
            )
          })}
        </div>
      </SettingsSection>
    </div>
  )
}
