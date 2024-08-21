import { Spinner } from "@nextui-org/react"
import type { UserLimited } from "@taiyomoe/types"
import { UserUtils } from "@taiyomoe/utils"
import { useAtomValue } from "jotai"
import Image from "next/image"
import Link from "next/link"
import { userProfileFollowersCountAtom } from "~/atoms/userProfile.atoms"
import { CountryFlag } from "~/components/ui/CountryFlag"
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
    return (
      <div className="flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  console.log("data", data)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex grow flex-wrap justify-center gap-4 bg-amber-900">
        {data.map((user) => (
          <Link
            key={user.id}
            className="group flex w-full transition-transform hover:scale-105 hover:cursor-pointer md:w-[320px]"
            href={`/user/${user.id}`}
          >
            <Image
              src={UserUtils.getAvatarUrl(user)}
              className="z-10 rounded-full"
              width={60}
              height={60}
              alt="Foto do usuário"
            />
            <div className="-ml-8 z-0 w-full rounded-large bg-content1 p-2 pl-10 group-hover:bg-content2">
              <div className="flex items-center gap-2">
                {user.profile.country && (
                  <CountryFlag country={user.profile.country} size={24} />
                )}
                <p className="font-medium group-hover:underline">{user.name}</p>
              </div>
              <p className="line-clamp-1 break-all text-foreground-400">
                {user.profile.about}
              </p>
            </div>
          </Link>
        ))}
      </div>
      <div>Pagination</div>
    </div>
  )
}
