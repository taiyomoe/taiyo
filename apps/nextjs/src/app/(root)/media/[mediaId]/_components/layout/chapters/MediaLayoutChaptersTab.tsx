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
  const chaptersNumbers = media.chapters.map((chapter) => chapter.number);

  const volumeAccordionTitle = (volume: string) => `Volume ${volume}`;
  const chapterAccordionTitle = (chapter: string) => `Capítulo ${chapter}`;

  return (
    <Accordion
      selectionMode="multiple"
      defaultExpandedKeys={computedVolumes.map(({ volume }) => volume)}
      className="px-0"
    >
      {computedVolumes.map(({ volume, groups }) => (
        <AccordionItem key={volume} title={volumeAccordionTitle(volume)}>
          <Accordion
            selectionMode="multiple"
            defaultExpandedKeys={chaptersNumbers}
            isCompact
            className="px-0"
          >
            {groups.map((group, i) => {
              const firstChapterNumber = group.at(0)?.number ?? "";

              return (
                <AccordionItem
                  key={group.at(0)?.number}
                  title={chapterAccordionTitle(firstChapterNumber)}
                  isCompact
                >
                  <MediaChapterGroupCard key={i} group={group} />
                </AccordionItem>
              );
            })}
          </Accordion>
        </AccordionItem>
      ))}
    </Accordion>
  );
};
