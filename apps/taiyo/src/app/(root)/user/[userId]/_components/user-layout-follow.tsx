import { auth } from "@taiyomoe/auth"
import { UsersService } from "@taiyomoe/services"
import type { UserLimited } from "@taiyomoe/types"
import { UserLayoutFollowButton } from "./user-layout-follow-button"

type Props = {
  user: UserLimited
}

export const UserLayoutFollow = async ({ user }: Props) => {
  const session = await auth()

  if (session?.user.id === user.id || !session) {
    return null
  }

  const isFollowing = await UsersService.isFollowing(session.user.id, user.id)

  return <UserLayoutFollowButton user={user} isFollowing={isFollowing} />
}
