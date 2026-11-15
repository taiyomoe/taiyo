import type { Sx } from "@taiyomoe/ui/styles/sx"
import { UserAdd, UserCheck } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { type UserProfile, useSetFollowing } from "@/features/users/api/profile"
import { m } from "@/paraglide/messages"

export function FollowButton({
  profile,
  size,
  sx,
}: {
  profile: UserProfile
  size?: "default" | "sm" | undefined
  sx?: Sx
}) {
  const setFollowing = useSetFollowing(profile)
  const following = profile.viewerFollows === true

  return (
    <Button
      onClick={() => {
        setFollowing.mutate(!following)
      }}
      size={size ?? "default"}
      sx={sx}
      variant={following ? "outline" : "default"}
    >
      {following ? <UserCheck /> : <UserAdd />}
      {following ? m.profile_following_button() : m.profile_follow()}
    </Button>
  )
}
