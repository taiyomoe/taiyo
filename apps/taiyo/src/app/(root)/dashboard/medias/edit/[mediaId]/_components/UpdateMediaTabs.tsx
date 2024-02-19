"use client"

import { Tab, Tabs } from "@nextui-org/tabs"
import { useEffect } from "react"

import type { MediaWithRelations } from "@taiyomoe/types"
import { UpdateMediaCoversShowcase } from "~/components/forms/mediaCovers/UpdateMediaCoversShowcase"
import { UploadMediaCoversForm } from "~/components/forms/mediaCovers/UploadMediaCoversForm"
import { UpdateMediaTitlesShowcase } from "~/components/forms/mediaTitles/update/UpdateMediaTitlesShowcase"
import { useMediaUpdateStore } from "~/stores"

import { UpdateMediaBannersTab } from "./tabs/UpdateMediaBannersTab"
import { UpdateMediaInfoTab } from "./tabs/UpdateMediaInfoTab"
import { UpdateMediaStatsTab } from "./tabs/UpdateMediaStatsTab"

type Props = {
  media: MediaWithRelations
}

export const UpdateMediaTabs = ({ media }: Props) => {
  const { load } = useMediaUpdateStore()

  useEffect(() => {
    load(media)
  }, [load, media])

  return (
    <Tabs
      classNames={{
        base: "border-b-content3 h-[54px] border-b pt-2 w-full",
        tabList: "h-full p-0",
        tab: "h-full max-w-fit",
        tabContent: "text-medium",
        panel: "p-0 mt-8",
      }}
      color="primary"
      variant="underlined"
      aria-label="Options"
    >
      <Tab key="info" title="Informações">
        <UpdateMediaInfoTab media={media} />
      </Tab>
      <Tab key="titles" title="Títulos">
        <UpdateMediaTitlesShowcase mediaId={media.id} />
      </Tab>
      <Tab key="covers" title="Covers" className="mt-0 flex flex-col gap-16">
        <UpdateMediaCoversShowcase media={media} />
        <UploadMediaCoversForm mediaId={media.id} />
      </Tab>
      <Tab key="banners" title="Banners">
        <UpdateMediaBannersTab media={media} />
      </Tab>
      <Tab key="stats" title="Estatísticas">
        <UpdateMediaStatsTab media={media} />
      </Tab>
    </Tabs>
  )
}
