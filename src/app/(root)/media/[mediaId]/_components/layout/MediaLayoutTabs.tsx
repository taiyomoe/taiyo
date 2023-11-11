"use client";

import { Tab, Tabs } from "@nextui-org/tabs";

import type { MediaLimited } from "~/lib/types";

import { MediaLayoutChaptersTab } from "./chapters/MediaLayoutChaptersTab";

type Props = {
  media: MediaLimited;
};

export const MediaLayoutTabs = ({ media }: Props) => {
  return (
    <div className="px-3">
      <Tabs
        classNames={{
          base: "border-b-content3 h-[54px] border-b pt-2 xl:h-[48px] w-full",
          tabList: "h-full p-0",
          tab: "h-full",
          tabContent: "text-medium",
          panel: "p-0 mt-8",
        }}
        defaultSelectedKey="chapters"
        disabledKeys={["info", "characters", "relations", "covers", "banners"]}
        color="primary"
        variant="underlined"
      >
        <Tab key="info" title="Informações" />
        <Tab key="chapters" title="Capítulos">
          <MediaLayoutChaptersTab media={media} />
        </Tab>
        <Tab key="characters" title="Personagens" />
        <Tab key="relations" title="Relações" />
        <Tab key="covers" title="Covers" />
        <Tab key="banners" title="Banners" />
      </Tabs>
    </div>
  );
};
