import type { MediaChapter } from "@taiyo/db";

type Props = {
  chapter: MediaChapter;
};

export const MediaChapterCard = ({ chapter }: Props) => {
  return (
    <div>
      <div>{chapter.number}</div>
      <div>{chapter.title}</div>
    </div>
  );
};
