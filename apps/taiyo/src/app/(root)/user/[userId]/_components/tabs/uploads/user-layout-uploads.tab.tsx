import { Pagination } from "@nextui-org/pagination"
import { Spinner } from "@nextui-org/spinner"
import {
  DEFAULT_GROUPED_CHAPTERS_PER_PAGE,
  GROUPED_CHAPTERS_CHOICES,
} from "@taiyomoe/constants"
import type { UserLimited } from "@taiyomoe/types"
import Image from "next/image"
import { UserUploadsMediaCard } from "~/app/(root)/user/[userId]/_components/tabs/uploads/user-uploads-media-card"
import { PerPageDropdown } from "~/components/ui/pagination/per-page-dropdown"
import { useUserNavigation } from "~/hooks/useUserNavigation"
import { api } from "~/trpc/react"

type Props = {
  user: UserLimited
}

export const UserLayoutUploadsTab = ({ user }: Props) => {
  const { page, perPage, setPage, setPerPage } = useUserNavigation()
  const { data, isLoading, isSuccess } =
    api.chapters.getLatestGroupedByUser.useQuery(
      { userId: user.id, page, perPage },
      {
        enabled: !!user.uploadsCount,
        refetchOnMount: false,
      },
    )

  if (data?.medias.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-8 p-12 md:flex-row md:gap-12 md:p-16">
        <p className="text-center font-medium text-lg md:text-xl lg:text-2xl">
          Nenhum capítulo upado
        </p>
        <Image
          src="/illustrations/no_data.svg"
          className="rounded-medium p-4"
          width={350}
          height={300}
          alt="Ilustração de amigos online"
        />
      </div>
    )
  }

  console.log("data", data)

  return (
    <div className="flex flex-col gap-4">
      {(isLoading || !data) && (
        <div className="flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      )}
      {data && (
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
      )}
      {isSuccess && (
        <div className="flex justify-end gap-4">
          <PerPageDropdown
            defaultChoice={DEFAULT_GROUPED_CHAPTERS_PER_PAGE}
            choices={GROUPED_CHAPTERS_CHOICES}
            renderOption={(o) => `${o} obras`}
            onChange={setPerPage}
          />
          <Pagination
            initialPage={page}
            total={data?.totalPages}
            color="primary"
            onChange={setPage}
            showControls
            showShadow
            siblings={0}
            isDisabled={isLoading || data?.totalPages === 1}
            isCompact
          />
        </div>
      )}
    </div>
  )
}
