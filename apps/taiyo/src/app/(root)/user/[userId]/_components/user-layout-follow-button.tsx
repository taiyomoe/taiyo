"use client"

import { Button } from "@nextui-org/button"
import type { UserLimited } from "@taiyomoe/types"
import { useSetAtom } from "jotai"
import { UserMinusIcon, UserPlusIcon } from "lucide-react"
import { useState } from "react"
import { userProfileFollowersCountAtom } from "~/atoms/userProfile.atoms"
import { useDevice } from "~/hooks/useDevice"
import { api } from "~/trpc/react"

type Props = {
  user: UserLimited
  isFollowing: boolean
}

export const UserLayoutFollowButton = ({
  user,
  isFollowing: initialIsFollowing,
}: Props) => {
  const { isAboveTablet } = useDevice()
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const setFollowersCount = useSetAtom(userProfileFollowersCountAtom)
  const { mutate, isPending } = api.users.toggleFollow.useMutation()

  const handlePress = () => {
    mutate(
      { followingId: user.id },
      {
        onSuccess: () => {
          setIsFollowing(!isFollowing)
          setFollowersCount((prev) => (isFollowing ? prev - 1 : prev + 1))
        },
      },
    )
  }

  return (
    <Button
      className="w-full min-w-fit font-medium sm:w-fit"
      onPress={handlePress}
      startContent={isFollowing ? <UserMinusIcon /> : <UserPlusIcon />}
      isLoading={isPending}
      color="primary"
      size={isAboveTablet ? "lg" : "md"}
    >
      {isFollowing ? "Deixar de seguir" : "Seguir"}
    </Button>
  )
}
