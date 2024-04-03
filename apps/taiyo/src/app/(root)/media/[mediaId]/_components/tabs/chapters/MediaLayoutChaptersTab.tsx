"use client"

import type { Selection } from "@nextui-org/react"
import { Spinner } from "@nextui-org/spinner"
import type { MediaLimited } from "@taiyomoe/types"
import { MediaChapterUtils } from "@taiyomoe/utils"
import Image from "next/image"
import { useEffect, useMemo, useState } from "react"
import { useMediaNavigation } from "~/hooks/useMediaNavigation"
import { api } from "~/trpc/react"
import { MediaChapterVolumes } from "./MediaChapterVolumes"
import { MediaChaptersTabActions } from "./MediaChaptersTabActions"

type Props = {
  media: MediaLimited
}

export const MediaLayoutChaptersTab = ({ media }: Props) => {
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set<string>())

  const { tab, page, perPage } = useMediaNavigation()
  const {
    data: chaptersPagination,
    isInitialLoading,
    isSuccess,
  } = api.mediaChapters.getByMediaId.useQuery(
    {
      mediaId: media.id,
      page,
      perPage,
    },
    { enabled: tab === "chapters" },
  )

  const volumeKeys = useMemo(
    () =>
      MediaChapterUtils.computeVolumeGroups(
        chaptersPagination?.chapters ?? [],
      ).map(({ volume }) => `volume-${volume}`),
    [chaptersPagination],
  )

  useEffect(() => {
    if (isSuccess) {
      setSelectedKeys(new Set(volumeKeys))
    }
  }, [isSuccess, volumeKeys])

  if (isInitialLoading || !chaptersPagination) {
    return (
      <div className="my-32 flex justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (chaptersPagination.chapters.length === 0) {
    return (
      <div className="flex flex-col items-center gap-12 py-16">
        <Image
          src="/illustrations/taken.svg"
          width={0}
          height={0}
          sizes="1"
          className="h-[40vh] w-auto"
          alt="alien taken by aliens"
        />
        <p className="font-semibold text-2xl">Sem capítulos no momento</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <MediaChaptersTabActions
        volumeKeys={volumeKeys}
        setSelectedKeys={setSelectedKeys}
      />
      <MediaChapterVolumes
        chaptersPagination={chaptersPagination}
        selectedKeys={selectedKeys}
        setSelectedKeys={setSelectedKeys}
      />
    </div>
  )
}
