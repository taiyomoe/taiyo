import type { MediaLimited } from "~/lib/types";

import { MediaInfoTabGenres } from "./MediaInfoTabGenres";
import { MediaInfoTabTags } from "./MediaInfoTabTags";
import { MediaInfoTabTitles } from "./MediaInfoTabTitles";
import { MediaInfoTabTrackers } from "./MediaInfoTabTrackers";

type Props = {
  media: MediaLimited;
};

export const MediaLayoutInfoTab = ({ media }: Props) => {
  return (
    <div className="mb-8 flex flex-col gap-8">
      <MediaInfoTabTrackers media={media} />
      <MediaInfoTabGenres media={media} />
      <MediaInfoTabTags media={media} />
      <MediaInfoTabTitles media={media} />
    </div>
  );
};
