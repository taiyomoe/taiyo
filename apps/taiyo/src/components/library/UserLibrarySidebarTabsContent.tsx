import { Image } from "@nextui-org/image"
import { Spinner } from "@nextui-org/react"
import { useSession } from "next-auth/react"
import NextImage from "next/image"
import Link from "next/link"
import { useEffect } from "react"

import type { UserLibraryStatus } from "@taiyomoe/types"
import { UserLibrarySidebarDeleteButton } from "~/components/library/UserLibrarySidebarDeleteButton"
import { UserLibrarySidebarStatusSelect } from "~/components/library/UserLibrarySidebarStatusSelect"
import { api } from "~/lib/trpc/client"
import { MediaUtils } from "~/lib/utils/media.utils"
import { MediaCoverUtils } from "~/lib/utils/mediaCover.utils"
import { useLibraryStore } from "~/stores"

type Props = {
  status: UserLibraryStatus
}

export const UserLibrarySidebarTabsContent = ({ status }: Props) => {
  const { addEntries, ...libraryStore } = useLibraryStore()
  const { data: session } = useSession()
  const { data, isLoading } = api.libary.getLibrary.useQuery(
    {
      status,
      userId: session!.user.id,
    },
    { refetchOnMount: false },
  )

  useEffect(() => {
    if (data) {
      addEntries(status, data)
    }
  }, [data, addEntries, status])

  if (isLoading || !data) {
    return (
      <div className="mt-8 flex w-full justify-center">
        <Spinner />
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="mt-12 flex w-full select-none flex-col items-center justify-center gap-6">
        <Image
          src="/illustrations/no_data.svg"
          width={150}
          height={150}
          alt="empty"
        />
        <p className="text-lg font-medium">Nenhuma obra encontrada</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {libraryStore[status].map((media) => (
        <div key={media.id} className="relative flex h-[80px] gap-2">
          <Image
            as={NextImage}
            src={MediaCoverUtils.getUrl(media)}
            className="object-fit h-full min-w-[60px] rounded-small"
            width={60}
            height={80}
            alt="media's cover"
          />
          <div className="flex grow flex-col justify-between gap-1">
            <Link
              className="line-clamp-1 text-lg font-medium hover:underline"
              href={MediaUtils.getUrl(media)}
            >
              {media.mainTitle}
            </Link>
            <div className="flex justify-between gap-1">
              <UserLibrarySidebarStatusSelect status={status} media={media} />
              <UserLibrarySidebarDeleteButton media={media} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
