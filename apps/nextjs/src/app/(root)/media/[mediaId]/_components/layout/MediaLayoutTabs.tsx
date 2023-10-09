"use client";

import { Tab, Tabs } from "@nextui-org/tabs";

import type { MediaLimited } from "@taiyo/db/types";

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
        }}
        defaultSelectedKey="chapters"
        disabledKeys={["characters", "relations", "covers"]}
        color="primary"
        variant="underlined"
      >
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
