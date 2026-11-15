// oxlint-disable-next-line no-unused-vars
import * as stylex from "@stylexjs/stylex"
import { config } from "@taiyomoe/config"
import { useQuery } from "@tanstack/react-query"
import type { Session } from "@/lib/session"
import { SettingSwitch } from "@/features/reader/components/sheet/setting-controls"
import { SettingsSection } from "@/features/settings/components/settings-section"
import { settingsStyles } from "@/features/settings/components/settings-styles"
import { sessionQueryOptions } from "@/lib/session"
import { useUpdateSettings } from "@/lib/settings"
import { m } from "@/paraglide/messages"

export function PrivacySettings({ user }: { user: Session["user"] }) {
  const updateSettings = useUpdateSettings()
  const { data: session } = useQuery({ ...sessionQueryOptions, staleTime: "static" })
  const settings = session?.user.settings ?? user.settings
  const showLibrary = settings.showLibrary ?? config.settings.showLibrary
  const showFollowing = settings.showFollowing ?? config.settings.showFollowing

  return (
    <SettingsSection
      description={m.user_settings_privacy_description()}
      title={m.user_settings_privacy_title()}
    >
      <div sx={settingsStyles.form}>
        <SettingSwitch
          checked={showLibrary}
          hint={m.user_settings_show_library_hint()}
          label={m.user_settings_show_library()}
          onChange={(checked) => {
            updateSettings.mutate({ showLibrary: checked })
          }}
        />
        <SettingSwitch
          checked={showFollowing}
          hint={m.user_settings_show_following_hint()}
          label={m.user_settings_show_following()}
          onChange={(checked) => {
            updateSettings.mutate({ showFollowing: checked })
          }}
        />
      </div>
    </SettingsSection>
  )
}
