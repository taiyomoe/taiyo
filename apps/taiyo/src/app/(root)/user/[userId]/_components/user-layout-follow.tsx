import { auth } from "@taiyomoe/auth"
import { type User, db } from "@taiyomoe/db"
import { UserLayoutFollowButton } from "./user-layout-follow-button"

type Props = {
  user: User
}

export const UserLayoutFollow = async ({ user }: Props) => {
  const session = await auth()

  if (session?.user.id === user.id || !session) {
    return null
  }

  const isFollowing = await db.userFollow.findFirst({
    where: { followerId: session.user.id, followedId: user.id },
  })

  return <UserLayoutFollowButton user={user} isFollowing={!!isFollowing} />
}
