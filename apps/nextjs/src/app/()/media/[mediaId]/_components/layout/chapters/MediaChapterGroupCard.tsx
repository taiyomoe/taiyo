import type { MediaChapterGroup } from "@taiyo/db";

import { MediaChapterCard } from "./MediaChapterCard";

type Props = {
  group: MediaChapterGroup;
};

export const MediaChapterGroupCard = ({ group }: Props) => {
  const computeChapterOrder = (chapterIndex: number) => {
    if (group.length === 1) return "unique";
    else if (chapterIndex === 0) return "first";
    else if (chapterIndex === group.length - 1) return "last";
    else return "middle";
  };

  return (
    <div className="p-1">
      {group.map((chapter, i) => (
        <MediaChapterCard
          key={i}
          chapter={chapter}
          order={computeChapterOrder(i)}
        />
      ))}
    </div>
  );
};
