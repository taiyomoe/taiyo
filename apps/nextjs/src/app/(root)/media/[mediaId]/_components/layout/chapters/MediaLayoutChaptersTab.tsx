"use client";

import { Accordion, AccordionItem } from "@nextui-org/accordion";

import type { MediaLimited } from "@taiyo/db/types";

import { MediaChapterUtils } from "~/utils/MediaChapterUtils";
import { MediaChapterGroupCard } from "./MediaChapterGroupCard";

type Props = {
  media: MediaLimited;
};

export const MediaLayoutChaptersTab = ({ media }: Props) => {
  const computedVolumes = MediaChapterUtils.computeVolumes(media.chapters);
  const volumeKeys = computedVolumes.map(({ volume }) => `volume-${volume}`);
  const groupKeys = media.chapters.map((chapter) => `group-${chapter.number}`);

  const volumeAccordionTitle = (volume: string) => `Volume ${volume}`;
  const chapterAccordionTitle = (chapter: number) => `Capítulo ${chapter}`;

  return (
    <Accordion
      className="px-0"
      selectionMode="multiple"
      defaultExpandedKeys={volumeKeys}
    >
      {computedVolumes.map(({ volume, groups }) => (
        <AccordionItem
          key={`volume-${volume}`}
          title={volumeAccordionTitle(volume)}
        >
          <Accordion
            className="px-0"
            selectionMode="multiple"
            defaultExpandedKeys={groupKeys}
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
  );
};
