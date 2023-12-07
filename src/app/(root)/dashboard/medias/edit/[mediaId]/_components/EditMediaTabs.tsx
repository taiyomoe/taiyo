"use client";

import { Tab, Tabs } from "@nextui-org/tabs";

import { UpdateMediaCoversShowcase } from "~/components/forms/mediaCovers/UpdateMediaCoversShowcase";
import { UploadMediaCoversForm } from "~/components/forms/mediaCovers/UploadMediaCoversForm";
import type { MediaWithRelations } from "~/lib/types";

import { EditMediaBannersTab } from "./tabs/EditMediaBannersTab";
import { EditMediaInfoTab } from "./tabs/EditMediaInfoTab";
import { EditMediaStatsTab } from "./tabs/EditMediaStatsTab";

type Props = {
  media: MediaWithRelations;
};

export const EditMediaTabs = ({ media }: Props) => (
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
      <EditMediaInfoTab media={media} />
    </Tab>
    <Tab key="covers" title="Covers" className="mt-0 flex flex-col gap-16">
      <UpdateMediaCoversShowcase media={media} />
      <UploadMediaCoversForm mediaId={media.id} />
    </Tab>
    <Tab key="banners" title="Banners">
      <EditMediaBannersTab media={media} />
    </Tab>
    <Tab key="stats" title="Estatísticas">
      <EditMediaStatsTab media={media} />
    </Tab>
  </Tabs>
);
