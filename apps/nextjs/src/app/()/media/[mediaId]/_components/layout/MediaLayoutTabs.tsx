"use client";

import { Tab, Tabs } from "@nextui-org/tabs";

import type { MediaWithRelations } from "@taiyo/db";

import { MediaLayoutChaptersTab } from "./chapters/MediaLayoutChaptersTab";

type Props = {
  media: MediaWithRelations;
};

export const MediaLayoutTabs = ({ media }: Props) => {
  return (
    <div className="px-3">
      <Tabs
        className="h-[54px] py-2 xl:h-[48px]"
        defaultSelectedKey="chapters"
        disabledKeys={["characters", "relations", "covers", "banners"]}
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
