import { Spinner } from "@nextui-org/spinner"
import type { UserLimited } from "@taiyomoe/types"
import { UserUploadsMediaCard } from "~/app/(root)/user/[userId]/_components/tabs/uploads/user-uploads-media-card"
import { api } from "~/trpc/react"

type Props = {
  user: UserLimited
}

export const UserLayoutUploadsTab = ({ user }: Props) => {
  const { data, isLoading } = api.chapters.getLatestGroupedByUser.useQuery(
    {
      userId: user.id,
      page: 1,
      perPage: 5,
    },
    {
      enabled: !!user.uploadsCount,
      refetchOnMount: false,
    },
  )

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  console.log("data", data)

  return (
    <div className="space-y-4 md:space-y-8">
      {data.medias.map((media, i) => (
        <UserUploadsMediaCard
          key={media.id}
          user={user}
          media={media}
          index={i}
        />
      ))}
    </div>
  )
}
