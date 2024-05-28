"use client"

import { Button } from "@nextui-org/button"
import { Popover, PopoverContent, PopoverTrigger } from "@nextui-org/popover"
import { useSession } from "@taiyomoe/auth/client"
import type { MediaLimited, UserLibraryMedia } from "@taiyomoe/types"
import { LibraryUtils } from "@taiyomoe/utils"
import { useEffect, useState } from "react"
import { UserLibraryStatusSelect } from "~/components/library/UserLibraryStatusSelect"
import { useLibraryStore } from "~/stores"

type Props = {
  media: MediaLimited
}

export const AddToUserLibraryButton = ({ media }: Props) => {
  const { updateEntry } = useLibraryStore()
  const [entry, setEntry] = useState<UserLibraryMedia | null>(null)
  const { data: session } = useSession()

  // biome-ignore lint/correctness/useExhaustiveDependencies: we want this to run only once
  useEffect(() => {
    if (media.userLibrary && !entry) {
      updateEntry(media, media.userLibrary.status)
    }
  }, [])

  if (!session) return null

  useLibraryStore.subscribe((state) => {
    const entry = state.getEntry(media.id)

    setEntry(entry ?? null)
  })

  return (
    <Popover placement="bottom" showArrow title="Biblioteca">
      <PopoverTrigger>
        <Button
          className="h-[38px] w-full font-medium text-md md:w-auto"
          color="primary"
          radius="sm"
        >
          {LibraryUtils.getStatusLabel(entry?.libraryStatus)}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] px-4 py-3">
        <UserLibraryStatusSelect
          media={media}
          currentStatus={entry?.libraryStatus}
        />
      </PopoverContent>
    </Popover>
  )
}
