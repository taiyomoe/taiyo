import type { UserLimited } from "@taiyomoe/types"
import { useAtomValue } from "jotai"
import Image from "next/image"
import { userProfileFollowersCountAtom } from "~/atoms/userProfile.atoms"
import { useUserNavigation } from "~/hooks/useUserNavigation"
import { api } from "~/trpc/react"

type Props = {
  user: UserLimited
}

export const UserLayoutFollowersTab = ({ user }: Props) => {
  const followersCount = useAtomValue(userProfileFollowersCountAtom)
  const { page, perPage } = useUserNavigation()
  const { data, isLoading } = api.users.getFollowers.useQuery(
    {
      userId: user.id,
      page,
      perPage,
    },
    { enabled: followersCount > 0 },
  )

  if (followersCount === 0 || data?.length === 0) {
    return (
      <div>
        <Image
          src="/illustrations/online_friends.svg"
          className="rounded-medium bg-content1 p-4"
          width={350}
          height={300}
          alt="Ilustração de amigos online"
        />
        <p>Nenhum seguidor encontrado</p>
      </div>
    )
  }

  if (isLoading || !data) {
    return <p>Loading...</p>
  }

  console.log("data", data)

  return (
    <div>
      <p>Followers</p>
      <p>{page}</p>
      <p>{perPage}</p>
    </div>
  )
}
