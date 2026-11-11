import * as stylex from "@stylexjs/stylex"
import { config } from "@taiyomoe/config"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { toastManager } from "@taiyomoe/ui/components/ui/toast"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { Session } from "@/lib/session"
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
import { sessionQueryOptions } from "@/lib/session"
import { useUpdateSettings } from "@/lib/settings"
import { m } from "@/paraglide/messages"

const PUSH_STATE_KEY = ["push", "state"] as const
const styles = stylex.create({
  device: {
    gap: "0.75rem",
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  status: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: "0.875rem",
    lineHeight: 1.5,
    maxWidth: "34rem",
  },
  actions: {
    gap: "0.5rem",
    display: "flex",
    flexWrap: "wrap",
  },
  skeleton: {
    height: "2.25rem",
    width: "100%",
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
    onSuccess: () => {
      toastManager.add({ title: m.user_settings_push_test_sent(), type: "success" })
    },
  })

  if (state.data === undefined) {
    return <Skeleton sx={styles.skeleton} />
  }

  if (state.data === "on") {
    return (
      <div sx={styles.device}>
        <p sx={styles.status}>{m.user_settings_push_on()}</p>
        <div sx={styles.actions}>
          <Button
            loading={test.isPending}
            onClick={() => {
              test.mutate()
            }}
            variant="outline"
          >
            {m.user_settings_push_test()}
          </Button>
          <Button
            loading={disable.isPending}
            onClick={() => {
              disable.mutate()
            }}
            variant="ghost"
          >
            {m.user_settings_push_disable()}
          </Button>
        </div>
      </div>
    )
  }

  if (state.data === "off") {
    return (
      <div sx={styles.device}>
        <p sx={styles.status}>{m.user_settings_push_off()}</p>
        <Button
          loading={enable.isPending}
          onClick={() => {
            enable.mutate()
          }}
        >
          {m.user_settings_push_enable()}
        </Button>
      </div>
    )
  }

  return (
    <p sx={styles.status}>
      {{
        denied: m.user_settings_push_denied,
        "needs-install": m.user_settings_push_needs_install,
        unsupported: m.user_settings_push_unsupported,
      }[state.data]()}
    </p>
  )
}

export function NotificationSettings({ user }: { user: Session["user"] }) {
  const updateSettings = useUpdateSettings()
  const { data: session } = useQuery({ ...sessionQueryOptions, staleTime: "static" })
  const settings = session?.user.settings ?? user.settings
  const defaults = config.settings

  return (
    <>
      <SettingsSection
        description={m.user_settings_push_device_description()}
        title={m.user_settings_push_device_title()}
      >
        <PushDevice />
      </SettingsSection>
      <SettingsSection
        description={m.user_settings_push_types_description()}
        title={m.user_settings_push_types_title()}
      >
        <div sx={settingsStyles.form}>
          <SettingSwitch
            checked={settings.pushLibraryChapters ?? defaults.pushLibraryChapters}
            hint={m.user_settings_push_library_hint()}
            label={m.user_settings_push_library()}
            onChange={(checked) => {
              updateSettings.mutate({ pushLibraryChapters: checked })
            }}
          />
          <SettingSwitch
            checked={settings.pushGroupChapters ?? defaults.pushGroupChapters}
            hint={m.user_settings_push_groups_hint()}
            label={m.user_settings_push_groups()}
            onChange={(checked) => {
              updateSettings.mutate({ pushGroupChapters: checked })
            }}
          />
          <SettingSwitch
            checked={settings.pushReplies ?? defaults.pushReplies}
            hint={m.user_settings_push_replies_hint()}
            label={m.user_settings_push_replies()}
            onChange={(checked) => {
              updateSettings.mutate({ pushReplies: checked })
            }}
          />
        </div>
      </SettingsSection>
    </>
  )
}
