import type { MediaLimited } from "~/lib/types";

import { MediaInfoTabTitles } from "./MediaInfoTabTitles";
import { MediaInfoTabTrackers } from "./MediaInfoTabTrackers";

type Props = {
  media: MediaLimited;
};

export const MediaLayoutInfoTab = ({ media }: Props) => {
  return (
    <div className="mb-8 flex flex-col gap-8">
      <MediaInfoTabTrackers media={media} />
      <MediaInfoTabTitles media={media} />
    </div>
  );
};
