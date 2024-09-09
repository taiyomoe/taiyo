import type { MediaLimited } from "@taiyomoe/types"
import { MediaInfoTabGenres } from "./media-info-tab-genres"
import { MediaInfoTabTags } from "./media-info-tab-tags"
import { MediaInfoTabTitles } from "./media-info-tab-titles"
import { MediaInfoTabTrackers } from "./media-info-tab-trackers"

type Props = {
  media: MediaLimited
}

export const MediaLayoutInfoTab = ({ media }: Props) => {
  return (
    <div className="mb-8 flex flex-col gap-8">
      <MediaInfoTabTrackers media={media} />
      <MediaInfoTabGenres media={media} />
      <MediaInfoTabTags media={media} />
      <MediaInfoTabTitles media={media} />
    </div>
  )
}
