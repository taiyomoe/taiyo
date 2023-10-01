import type { MediaChapterGroup } from "@taiyo/db";

import { MediaChapterCard } from "./MediaChapterCard";

type Props = {
  group: MediaChapterGroup;
};

export const MediaChapterGroupCard = ({ group }: Props) => {
  return group.map((chapter, i) => (
    <MediaChapterCard key={i} chapter={chapter} />
  ));
};
