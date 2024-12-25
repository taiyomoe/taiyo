import { auth } from "@taiyomoe/auth/server"
import type { UserLimited } from "@taiyomoe/types"
import { UsersService } from "~/services/users.web-service"
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
