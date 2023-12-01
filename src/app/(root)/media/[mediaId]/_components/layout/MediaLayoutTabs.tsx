"use client";

import type { Key } from "react";
import { useCallback } from "react";
import { Tab, Tabs } from "@nextui-org/tabs";

import { useMediaNavigation } from "~/hooks/useMediaNavigation";
import type { MediaLimited, MediaTabs } from "~/lib/types";

import { MediaLayoutChaptersTab } from "../tabs/chapters/MediaLayoutChaptersTab";
import { MediaLayoutInfoTab } from "../tabs/info/MediaLayoutInfoTab";

type Props = {
  media: MediaLimited;
};

export const MediaLayoutTabs = ({ media }: Props) => {
  const { tab, setTab } = useMediaNavigation();

  const handleSelectionChange = useCallback(
    async (key: Key) => {
      await setTab(key.toString() as MediaTabs);
    },
    [setTab],
  );

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
  );
};
