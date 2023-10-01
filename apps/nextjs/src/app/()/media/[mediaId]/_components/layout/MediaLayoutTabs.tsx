"use client";

import { Tab, Tabs } from "@nextui-org/tabs";

import type { MediaWithRelations } from "@taiyo/db";

import { MediaLayoutChaptersTab } from "./chapters/MediaLayoutChaptersTab";

type Props = {
  media: MediaWithRelations;
};

export const MediaLayoutTabs = ({ media }: Props) => {
  return (
    <div className="bg-green-900 bg-opacity-50 px-3">
      <Tabs defaultSelectedKey="chapters" className="h-[54px] py-2 xl:h-[48px]">
        <Tab key="chapters" title="Capítulos">
          <MediaLayoutChaptersTab media={media} />
        </Tab>
        <Tab key="characters" title="Personagens" disabled />
        <Tab key="relations" title="Relações" disabled />
      </Tabs>
    </div>
  );
};
