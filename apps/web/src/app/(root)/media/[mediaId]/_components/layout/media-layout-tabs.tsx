"use client"

import { Tab, Tabs } from "@nextui-org/tabs"
import type { MediaLimited, MediaTabs } from "@taiyomoe/types"
import type { Key } from "react"
import { useCallback } from "react"
import { useMediaNavigation } from "~/hooks/useMediaNavigation"
import { MediaLayoutChaptersTab } from "../tabs/chapters/media-layout-chapters-tab"
import { MediaLayoutInfoTab } from "../tabs/info/media-layout-info-tab"

type Props = {
  media: MediaLimited
}

export const MediaLayoutTabs = ({ media }: Props) => {
  const { tab, setTab } = useMediaNavigation()

  const handleSelectionChange = useCallback(
    async (key: Key) => {
      await setTab(key.toString() as MediaTabs)
    },
    [setTab],
  )

  return (
    <Tabs
      classNames={{
        base: "border-b-content3 h-[54px] border-b pt-2 w-full",
        tabList: "h-full p-0",
        tab: "h-full max-w-fit",
        tabContent: "text-medium",
        panel: "p-0 mt-8",
      }}
      defaultSelectedKey={tab}
      disabledKeys={["characters", "relations", "covers", "banners"]}
      onSelectionChange={handleSelectionChange}
      color="primary"
      variant="underlined"
    >
      <Tab key="info" title="Informações">
        <MediaLayoutInfoTab media={media} />
      </Tab>
      <Tab key="chapters" title="Capítulos">
        <MediaLayoutChaptersTab media={media} />
      </Tab>
      <Tab key="characters" title="Personagens" />
      <Tab key="relations" title="Relações" />
      <Tab key="covers" title="Covers" />
      <Tab key="banners" title="Banners" />
    </Tabs>
  )
}
