import { type MediaChapterGroup } from "~/lib/types";
import { MediaChapterCard } from "./MediaChapterCard";

type Props = {
  group: MediaChapterGroup;
};

export const MediaChapterGroupCard = ({ group }: Props) => {
  const computeChapterOrder = (chapterIndex: number) => {
    if (group.chapters.length === 1) return "unique";
    else if (chapterIndex === 0) return "first";
    else if (chapterIndex === group.chapters.length - 1) return "last";
    else return "middle";
  };

  return (
    <div className="mb-3 p-1">
      {group.chapters.map((chapter, i) => (
        <MediaChapterCard
          key={i}
          chapter={chapter}
          order={computeChapterOrder(i)}
        />
      ))}
    </div>
  );
};
