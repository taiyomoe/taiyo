"use client";

import { Accordion, AccordionItem } from "@nextui-org/react";

import type { MediaWithRelations } from "@taiyo/db";

import { MediaUtils } from "~/utils/MediaUtils";
import { MediaChapterCard } from "./MediaChapterCard";

type Props = {
  media: MediaWithRelations;
};

export const MediaLayoutChaptersTab = ({ media }: Props) => {
  const computedVolumes = MediaUtils.computeVolumes(media.chapters);

  return (
    <Accordion
      selectionMode="multiple"
      defaultExpandedKeys={computedVolumes.map(({ volume }) => volume)}
    >
      {computedVolumes.map(({ volume, chapters }) => (
        <AccordionItem key={volume} title={`Volume ${volume}`}>
          {chapters.map((chapter) => (
            <MediaChapterCard key={chapter.id} chapter={chapter} />
          ))}
        </AccordionItem>
      ))}
    </Accordion>
  );
};
