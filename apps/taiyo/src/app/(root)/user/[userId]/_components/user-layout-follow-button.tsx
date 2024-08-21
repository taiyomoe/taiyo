"use client"

import { Button } from "@nextui-org/button"
import type { UserLimited } from "@taiyomoe/types"
import { useSetAtom } from "jotai"
import { UserMinusIcon, UserPlusIcon } from "lucide-react"
import { useState } from "react"
import { userProfileFollowersCountAtom } from "~/atoms/userProfile.atoms"
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
  const { mutate, isPending } = api.users.toggleFollow.useMutation()
  const { data: session } = useSession()

  const handlePress = () => {
    mutate(
      { followingId: user.id },
      {
        onSuccess: () => {
          setIsFollowing(!isFollowing)

          if (session!.user.showFollowing) {
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
      startContent={isFollowing ? <UserMinusIcon /> : <UserPlusIcon />}
      isLoading={isPending}
      color="primary"
    >
      {isFollowing ? "Deixar de seguir" : "Seguir"}
    </Button>
  )
}
