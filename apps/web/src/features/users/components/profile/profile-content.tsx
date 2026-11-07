// oxlint-disable-next-line no-unused-vars
import * as stylex from "@stylexjs/stylex"
import { useSuspenseQuery } from "@tanstack/react-query"
import type { Session } from "@/lib/session"
import { userProfileQueryOptions } from "@/features/users/api/profile"
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

  useProfileCommands(profile, viewer)

  return (
    <div sx={profileStyles.root}>
      <ProfileBanner isOwner={viewer?.id === profile.id} profile={profile} />
      <div sx={profileStyles.container}>
        <ProfileHeader profile={profile} viewer={viewer} />
        <ProfileTabs profile={profile} viewer={viewer} />
      </div>
    </div>
  )
}
