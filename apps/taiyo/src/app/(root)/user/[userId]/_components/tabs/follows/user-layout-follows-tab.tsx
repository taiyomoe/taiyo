import { Pagination } from "@nextui-org/pagination"
import { Spinner } from "@nextui-org/spinner"
import { useSession } from "@taiyomoe/auth/client"
import { USER_FOLLOWS_PER_PAGE_CHOICES } from "@taiyomoe/constants"
import type { UserLimited } from "@taiyomoe/types"
import { useAtomValue } from "jotai"
import Image from "next/image"
import { userProfileOwnFollowerAtom } from "~/atoms/userProfile.atoms"
import { PerPageDropdown } from "~/components/ui/pagination/per-page-dropdown"
import { useUserNavigation } from "~/hooks/useUserNavigation"
import { api } from "~/trpc/react"
import { UserFollowsTabCard } from "./user-follows-tab-card"

type Props = {
  user: UserLimited
  type: "followers" | "following"
}

export const UserLayoutFollowsTab = ({ user, type }: Props) => {
  const ownUser = useAtomValue(userProfileOwnFollowerAtom)
  const { page, perPage, setPage, setPerPage } = useUserNavigation()
  const { data: session } = useSession()
  const { data, isLoading } = api.users[
    type === "followers" ? "getFollowers" : "getFollowing"
  ].useQuery(
    {
      userId: user.id,
      page,
      perPage,
    },
    { enabled: !!user.followingCount, refetchOnMount: false },
  )

  if (
    !user.followingCount ||
    user.followingCount === 0 ||
    data?.users.length === 0
  ) {
    return (
      <div className="flex flex-col items-center justify-center gap-8 p-12 md:flex-row md:gap-12 md:p-16">
        <p className="text-center font-medium text-lg md:text-xl lg:text-2xl">
          {type === "followers"
            ? "Nenhum seguidor encontrado :("
            : "Ninguém segue este usuário :("}
        </p>
        <Image
          src="/illustrations/online_friends.svg"
          className="rounded-medium p-4"
          width={350}
          height={300}
          alt="Ilustração de amigos online"
        />
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

  /**
   * If the logged in user just followed the user profile, then we add him to the list.
   *
   * Otherwise, we remove the logged in user from the list.
   */
  const updatedUser = data.users
    .concat(
      ownUser && !data.users.some((u) => u.id === ownUser.id) ? [ownUser] : [],
    )
    .filter((u) => {
      if (ownUser === null && u.id === session?.user.id) return false

      return true
    })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex grow flex-wrap justify-center gap-4">
        {updatedUser.map((u) => (
          <UserFollowsTabCard key={u.id} user={u} />
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
