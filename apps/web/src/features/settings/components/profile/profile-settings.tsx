// oxlint-disable-next-line no-unused-vars
import * as stylex from "@stylexjs/stylex"
import { useSuspenseQuery } from "@tanstack/react-query"
import type { Session } from "@/lib/session"
import { AboutSection } from "@/features/settings/components/profile/about-section"
import { CosmeticsSection } from "@/features/settings/components/profile/cosmetics-section"
import { ProfileImagesSection } from "@/features/settings/components/profile/profile-images-section"
import { settingsStyles } from "@/features/settings/components/settings-styles"
import { userProfileQueryOptions } from "@/features/users/api/profile"

export function ProfileSettings({ user }: { user: Session["user"] }) {
  const { data: profile } = useSuspenseQuery(userProfileQueryOptions(user.username ?? ""))

  return (
    <div sx={settingsStyles.stack}>
      <ProfileImagesSection profile={profile} />
      <AboutSection profile={profile} />
      <CosmeticsSection profile={profile} />
    </div>
  )
}
