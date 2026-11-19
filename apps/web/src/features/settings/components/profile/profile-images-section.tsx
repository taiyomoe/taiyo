import * as stylex from "@stylexjs/stylex"
import { Image, Trash } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { breakpoints } from "@taiyomoe/ui/styles/tokens.stylex"
import type { UserProfile } from "@/features/users/api/profile"
import { SettingsSection } from "@/features/settings/components/settings-section"
import { settingsStyles } from "@/features/settings/components/settings-styles"
import { ProfileImagesPreview } from "@/features/users/components/profile/profile-images-preview"
import { useProfileImageUpload } from "@/features/users/components/profile/use-profile-image-upload"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  controls: {
    gap: "1rem",
    display: "grid",
    gridTemplateColumns: {
      default: "minmax(0, 1fr)",
      [breakpoints.sm]: "repeat(2, minmax(0, 1fr))",
    },
  },
  control: {
    gap: "0.625rem",
    display: "flex",
    flexDirection: "column",
  },
  label: {
    fontSize: "0.875rem",
    fontWeight: 600,
  },
  buttons: {
    gap: "0.5rem",
    display: "flex",
    flexWrap: "wrap",
  },
})

export function ProfileImagesSection({ profile }: { profile: UserProfile }) {
  const avatar = useProfileImageUpload(profile, "avatar")
  const banner = useProfileImageUpload(profile, "banner")

  return (
    <SettingsSection
      description={m.user_settings_images_description()}
      title={m.user_settings_images_title()}
    >
      <div sx={settingsStyles.stack}>
        <ProfileImagesPreview profile={profile} />
        <div sx={styles.controls}>
          <div sx={styles.control}>
            <span sx={styles.label}>{m.user_settings_avatar()}</span>
            <span sx={settingsStyles.muted}>{m.user_settings_avatar_hint()}</span>
            <div sx={styles.buttons}>
              <Button onClick={avatar.pick} size="sm" variant="outline">
                <Image />
                {m.profile_change_avatar()}
              </Button>
              {profile.image === null ? null : (
                <Button
                  disabled={avatar.removing}
                  onClick={avatar.remove}
                  size="sm"
                  variant="outline"
                >
                  <Trash />
                  {m.profile_remove_avatar()}
                </Button>
              )}
            </div>
          </div>
          <div sx={styles.control}>
            <span sx={styles.label}>{m.user_settings_banner()}</span>
            <span sx={settingsStyles.muted}>{m.user_settings_banner_hint()}</span>
            <div sx={styles.buttons}>
              <Button onClick={banner.pick} size="sm" variant="outline">
                <Image />
                {m.profile_change_banner()}
              </Button>
              {profile.bannerUrl === null ? null : (
                <Button
                  disabled={banner.removing}
                  onClick={banner.remove}
                  size="sm"
                  variant="outline"
                >
                  <Trash />
                  {m.profile_remove_banner()}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      {avatar.element}
      {banner.element}
    </SettingsSection>
  )
}
