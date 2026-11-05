import * as stylex from "@stylexjs/stylex"
import { Image, Trash } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { breakpoints, colors, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import type { UserProfile } from "@/features/users/api/profile"
import { PersonAvatar } from "@/features/groups/components/group-avatar"
import { SettingsSection } from "@/features/settings/components/settings-section"
import { settingsStyles } from "@/features/settings/components/settings-styles"
import { useProfileImageUpload } from "@/features/users/components/profile/use-profile-image-upload"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  preview: {
    position: "relative",
    paddingBottom: { default: "2.75rem", [breakpoints.sm]: "3.5rem" },
  },
  banner: {
    borderRadius: radius.xl,
    overflow: "hidden",
    aspectRatio: "3 / 1",
    backgroundColor: colors.muted,
    width: "100%",
  },
  bannerImage: {
    display: "block",
    objectFit: "cover",
    height: "100%",
    width: "100%",
  },
  avatarFrame: {
    padding: "0.25rem",
    borderRadius: radius.full,
    backgroundColor: colors.card,
    position: "absolute",
    bottom: 0,
    left: { default: "1rem", [breakpoints.sm]: "1.5rem" },
  },
  avatar: {
    height: { default: "5.5rem", [breakpoints.sm]: "7rem" },
    width: { default: "5.5rem", [breakpoints.sm]: "7rem" },
  },
  avatarFallback: {
    fontSize: "2rem",
  },
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
        <div sx={styles.preview}>
          <div sx={styles.banner}>
            {profile.bannerUrl === null ? null : (
              <img alt="" draggable={false} src={profile.bannerUrl} sx={styles.bannerImage} />
            )}
          </div>
          <div sx={styles.avatarFrame}>
            <PersonAvatar fallbackSx={styles.avatarFallback} person={profile} sx={styles.avatar} />
          </div>
        </div>
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
                  variant="ghost"
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
                  variant="ghost"
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
