// StyleX only compiles the `sx` props of files that import it.
// oxlint-disable-next-line no-unused-vars
import * as stylex from "@stylexjs/stylex"
import { useSuspenseQuery } from "@tanstack/react-query"
import type { Session } from "@/lib/session"
import { MediaBackdrop } from "@/features/media/components/media-page/media-backdrop"
import { userProfileQueryOptions } from "@/features/users/api/profile"
import { ProfileActions } from "@/features/users/components/profile/profile-actions"
import { ProfileAvatar } from "@/features/users/components/profile/profile-avatar"
import { ProfileBanner } from "@/features/users/components/profile/profile-banner"
import { ProfileHeader } from "@/features/users/components/profile/profile-header"
import { profileStyles } from "@/features/users/components/profile/profile-styles"
import { ProfileTabs } from "@/features/users/components/profile/profile-tabs"
import { useProfileCommands } from "@/features/users/hooks/use-profile-commands"

export function ProfileContent({
  username,
  viewer,
}: {
  username: string
  viewer: Session["user"] | null
}) {
  const { data: profile } = useSuspenseQuery(userProfileQueryOptions(username))
  const isOwner = viewer?.id === profile.id

  useProfileCommands(profile, viewer)

  return (
    <div sx={profileStyles.root}>
      <div sx={profileStyles.backdrop}>
        <MediaBackdrop src={profile.bannerUrl} />
      </div>
      <div sx={profileStyles.container}>
        <ProfileBanner isOwner={isOwner} profile={profile} />
      </div>
      <div sx={profileStyles.layout}>
        <aside sx={profileStyles.aside}>
          <div sx={profileStyles.avatarSlot}>
            <ProfileAvatar isOwner={isOwner} profile={profile} />
          </div>
          <div sx={profileStyles.actionsSlot}>
            <ProfileActions profile={profile} viewer={viewer} />
          </div>
        </aside>
        <div sx={profileStyles.main}>
          <ProfileHeader profile={profile} />
          <div sx={profileStyles.tabsSlot}>
            <ProfileTabs profile={profile} viewer={viewer} />
          </div>
        </div>
      </div>
    </div>
  )
}
