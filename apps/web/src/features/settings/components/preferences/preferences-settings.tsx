import * as stylex from "@stylexjs/stylex"
import { Checkbox } from "@taiyomoe/ui/components/ui/checkbox"
import { colors, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { use } from "react"
import { CONTENT_RATING_LABELS } from "@/features/media/lib/media-labels"
import { SettingChoice } from "@/features/reader/components/sheet/setting-controls"
import { ContentRatingLabel } from "@/features/settings/components/content-rating-label"
import { SettingsSection } from "@/features/settings/components/settings-section"
import { settingsStyles } from "@/features/settings/components/settings-styles"
import { type ContentRating, useSettings, useUpdateSettings } from "@/lib/settings"
import { type ThemePreference, ThemeContext } from "@/lib/theme"
import { m } from "@/paraglide/messages"

const CONTENT_RATINGS = [
  { value: "NORMAL", hint: m.user_settings_rating_normal },
  { value: "SUGGESTIVE", hint: m.user_settings_rating_suggestive },
  { value: "NSFW", hint: m.user_settings_rating_nsfw },
  { value: "NSFL", hint: m.user_settings_rating_nsfl },
] as const satisfies Array<{ value: ContentRating; hint: () => string }>
const styles = stylex.create({
  rating: {
    borderColor: colors.border,
    borderRadius: radius.xl,
    borderStyle: "solid",
    borderWidth: 1,
    gap: "0.875rem",
    paddingBlock: "0.875rem",
    paddingInline: "1rem",
    alignItems: "flex-start",
    cursor: { default: "pointer", ":has(:disabled)": "not-allowed" },
    display: "flex",
  },
  ratingText: {
    gap: "0.25rem",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  ratingLabel: {
    fontSize: "0.875rem",
    fontWeight: 500,
  },
  checkbox: {
    marginTop: "0.3125rem",
  },
})

export function PreferencesSettings() {
  const theme = use(ThemeContext)
  const { contentRatings, latestUpdatesLayout } = useSettings()
  const updateSettings = useUpdateSettings()

  return (
    <div sx={settingsStyles.stack}>
      <SettingsSection
        description={m.user_settings_appearance_description()}
        title={m.user_settings_appearance_title()}
      >
        <div sx={settingsStyles.form}>
          <SettingChoice<ThemePreference>
            label={m.shell_theme()}
            onChange={theme.setPreference}
            options={[
              { value: "light", label: m.shell_theme_light() },
              { value: "dark", label: m.shell_theme_dark() },
              { value: "system", label: m.shell_theme_system() },
            ]}
            value={theme.preference}
          />
          <SettingChoice
            hint={m.user_settings_layout_hint()}
            label={m.home_latest_layout()}
            onChange={(layout) => {
              updateSettings.mutate({ latestUpdatesLayout: layout })
            }}
            options={[
              { value: "LIST", label: m.home_latest_layout_list() },
              { value: "GRID", label: m.home_latest_layout_grid() },
              { value: "COMPACT", label: m.home_latest_layout_compact() },
            ]}
            value={latestUpdatesLayout}
          />
        </div>
      </SettingsSection>
      <SettingsSection
        description={m.user_settings_content_description()}
        title={m.content_filter()}
      >
        <ul sx={settingsStyles.list}>
          {CONTENT_RATINGS.map(({ value, hint }) => {
            const checked = contentRatings.includes(value)
            const last = checked && contentRatings.length === 1

            return (
              <li key={value}>
                <label sx={styles.rating} title={last ? m.content_filter_last() : undefined}>
                  <Checkbox
                    checked={checked}
                    disabled={last}
                    onCheckedChange={(next) => {
                      updateSettings.mutate({
                        contentRating: CONTENT_RATINGS.map((rating) => rating.value).filter(
                          (candidate) =>
                            candidate === value ? next : contentRatings.includes(candidate),
                        ),
                      })
                    }}
                    sx={styles.checkbox}
                  />
                  <span sx={styles.ratingText}>
                    <span sx={styles.ratingLabel}>
                      <ContentRatingLabel label={CONTENT_RATING_LABELS[value]()} rating={value} />
                    </span>
                    <span sx={settingsStyles.muted}>{hint()}</span>
                  </span>
                </label>
              </li>
            )
          })}
        </ul>
      </SettingsSection>
    </div>
  )
}
