"use client"

import { Button } from "@nextui-org/button"
import type { User } from "@taiyomoe/db"
import { UserMinusIcon, UserPlusIcon } from "lucide-react"
import { useState } from "react"
import { api } from "~/trpc/react"

type Props = {
  user: User
  isFollowing: boolean
}

export const UserLayoutFollowButton = ({
  user,
  isFollowing: initialIsFollowing,
}: Props) => {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const { mutate, isPending } = api.users.toggleFollow.useMutation()

  const handlePress = () => {
    mutate(
      { followingId: user.id },
      { onSuccess: () => setIsFollowing(!isFollowing) },
    )
  }

  return (
    <Button
      className="min-w-fit font-medium"
      onPress={handlePress}
      startContent={isFollowing ? <UserMinusIcon /> : <UserPlusIcon />}
      isLoading={isPending}
      color="primary"
      size="lg"
    >
      {isFollowing ? "Deixar de seguir" : "Seguir"}
    </Button>
  )
}
