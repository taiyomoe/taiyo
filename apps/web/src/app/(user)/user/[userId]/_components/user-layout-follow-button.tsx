"use client"

import { Button } from "@heroui/button"
import { authClient } from "@taiyomoe/auth/client"
import type { UserLimited } from "@taiyomoe/types"
import { useSetAtom } from "jotai"
import { UserMinusIcon, UserPlusIcon } from "lucide-react"
import { useState } from "react"
import {
  userProfileFollowersCountAtom,
  userProfileOwnFollowerAtom,
} from "~/atoms/userProfile.atoms"
import { api } from "~/trpc/react"

type Props = {
  user: UserLimited
  isFollowing: boolean
}

export const UserLayoutFollowButton = ({
  user,
  isFollowing: initialIsFollowing,
}: Props) => {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const setFollowersCount = useSetAtom(userProfileFollowersCountAtom)
  const setOwnUser = useSetAtom(userProfileOwnFollowerAtom)
  const { mutate, isPending } = api.users.toggleFollow.useMutation()
  const { data: session } = authClient.useSession()

  const handlePress = () => {
    mutate(
      { followingId: user.id },
      {
        onSuccess: (data) => {
          setIsFollowing(!isFollowing)
          setOwnUser(data ?? null)

          if (session!.user.settings.showFollowing) {
            setFollowersCount((prev) => (isFollowing ? prev - 1 : prev + 1))
          }
        },
      },
    )
  }

  return (
    <Button
      className="w-full min-w-fit font-medium sm:w-fit md:h-12 md:gap-3 md:rounded-large md:px-6 md:text-medium"
      onPress={handlePress}
      startContent={
        isPending ? undefined : isFollowing ? (
          <UserMinusIcon />
        ) : (
          <UserPlusIcon />
        )
      }
      isLoading={isPending}
      color="primary"
    >
      {isFollowing ? "Deixar de seguir" : "Seguir"}
    </Button>
  )
}
