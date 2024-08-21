import { Pagination } from "@nextui-org/pagination"
import { Spinner } from "@nextui-org/spinner"
import { USER_FOLLOWS_PER_PAGE_CHOICES } from "@taiyomoe/constants"
import type { UserLimited } from "@taiyomoe/types"
import { useAtomValue } from "jotai"
import Image from "next/image"
import { userProfileFollowersCountAtom } from "~/atoms/userProfile.atoms"
import { PerPageDropdown } from "~/components/ui/pagination/per-page-dropdown"
import { useUserNavigation } from "~/hooks/useUserNavigation"
import { api } from "~/trpc/react"
import { UserFollowersTabCard } from "./user-followers-tab-card"

type Props = {
  user: UserLimited
}

export const UserLayoutFollowersTab = ({ user }: Props) => {
  const followersCount = useAtomValue(userProfileFollowersCountAtom)
  const { page, perPage, setPage, setPerPage } = useUserNavigation()
  const { data, isLoading } = api.users.getFollowers.useQuery(
    {
      userId: user.id,
      page,
      perPage,
    },
    { enabled: followersCount > 0 },
  )

  if (followersCount === 0 || data?.followers.length === 0) {
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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex grow flex-wrap justify-center gap-4">
        {data.followers.map((user) => (
          <UserFollowersTabCard key={user.id} user={user} />
        ))}
      </div>
      <div className="flex justify-end gap-4">
        <PerPageDropdown
          defaultChoice={perPage}
          choices={USER_FOLLOWS_PER_PAGE_CHOICES}
          renderOption={(o) => `${o} usuários`}
          onChange={setPerPage}
        />
        <Pagination
          initialPage={page}
          total={data.totalPages}
          color="primary"
          onChange={setPage}
          showControls
          showShadow
          isDisabled={isLoading || data.totalPages === 1}
          isCompact
        />
      </div>
    </div>
  )
}
