"use client";

import { useState } from "react";
import { Accordion, AccordionItem } from "@nextui-org/accordion";
import { Divider } from "@nextui-org/divider";

import type { MediaLimited } from "@taiyo/db/types";

import { MediaChapterUtils } from "~/utils/MediaChapterUtils";
import { MediaChapterGroupCard } from "./MediaChapterGroupCard";
import { MediaChaptersTabActions } from "./MediaChaptersTabActions";
import { MediaChaptersTabPagination } from "./MediaChaptersTabPagination";

type Props = {
  media: MediaLimited;
};

export const MediaLayoutChaptersTab = ({ media }: Props) => {
  const computedVolumes = MediaChapterUtils.computeVolumes(media.chapters);
  const volumeKeys = computedVolumes.map(({ volume }) => `volume-${volume}`);
  const groupKeys = media.chapters.map((chapter) => `group-${chapter.number}`);

  const [selectedVolumeKeys, setSelectedVolumeKeys] = useState(
    new Set(volumeKeys),
  );
  const [selectedGroupKeys, setSelectedGroupKeys] = useState(
    new Set(groupKeys),
  );

  const volumeAccordionTitle = (volume: string) => `Volume ${volume}`;
  const chapterAccordionTitle = (chapter: number) => `Capítulo ${chapter}`;

  const collapseVolumes = () => {
    setSelectedVolumeKeys(new Set());
    setSelectedGroupKeys(new Set());
  };
  const expandVolumes = () => {
    setSelectedVolumeKeys(new Set(volumeKeys));
  };

  if (
    Array.from(selectedVolumeKeys).some((key) => !volumeKeys.includes(key)) ||
    Array.from(selectedVolumeKeys).length !== volumeKeys.length
  ) {
    setSelectedVolumeKeys(new Set(volumeKeys));
  }

  if (
    Array.from(selectedGroupKeys).some((key) => !groupKeys.includes(key)) ||
    Array.from(selectedGroupKeys).length !== groupKeys.length
  ) {
    setSelectedGroupKeys(new Set(groupKeys));
  }

  return (
    <div className="flex flex-col gap-2">
      <MediaChaptersTabActions
        collapseVolumes={collapseVolumes}
        expandVolumes={expandVolumes}
      />
      <Accordion
        className="px-0"
        selectionMode="multiple"
        selectedKeys={selectedVolumeKeys}
        defaultExpandedKeys={volumeKeys}
        // @ts-expect-error -- NextUI wrong types
        onSelectionChange={setSelectedVolumeKeys}
      >
        {computedVolumes.map(({ volume, groups }) => (
          <AccordionItem
            key={`volume-${volume}`}
            title={volumeAccordionTitle(volume)}
          >
            <Accordion
              className="px-0"
              selectionMode="multiple"
              selectedKeys={selectedGroupKeys}
              defaultExpandedKeys={groupKeys}
              // @ts-expect-error -- NextUI wrong types
              onSelectionChange={setSelectedGroupKeys}
              isCompact
            >
              {groups.map((group, i) => (
                <AccordionItem
                  key={`group-${group.number}`}
                  title={chapterAccordionTitle(group.number)}
                  classNames={{ title: "text-sm" }}
                >
                  <MediaChapterGroupCard key={i} group={group} />
                </AccordionItem>
              ))}
            </Accordion>
          </AccordionItem>
        ))}
      </Accordion>
      <Divider className="my-4" />
      <MediaChaptersTabPagination totalPages={media.totalPages} />
    </div>
  );
};
