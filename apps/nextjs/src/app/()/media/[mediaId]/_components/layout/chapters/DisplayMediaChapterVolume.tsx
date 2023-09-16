import type { MediaChapters } from "@taiyo/db";

import { MediaChapterCard } from "./MediaChapterCard";

type Props = {
  volume: string;
  chapters: MediaChapters;
};

export const DisplayMediaChapterVolume = ({ volume, chapters }: Props) => {
  return (
    <div>
      <p>Volume {volume}</p>
      <div>
        {chapters.map((chapter) => (
          <MediaChapterCard key={chapter.id} chapter={chapter} />
        ))}
      </div>
    </div>
  );
};
