import type { MediaWithRelations } from "@taiyo/db";

import { TabsContent } from "~/components/ui/Tabs";
import { MediaUtils } from "~/utils/MediaUtils";
import { DisplayMediaChapterVolume } from "./DisplayMediaChapterVolume";

type Props = {
  media: MediaWithRelations;
};

export const MediaLayoutChaptersTab = ({ media }: Props) => {
  const computedVolumes = MediaUtils.computeVolumes(media.chapters);

  return (
    <TabsContent value="chapters">
      {computedVolumes.map(({ volume, chapters }) => (
        <DisplayMediaChapterVolume
          key={volume}
          volume={volume}
          chapters={chapters}
        />
      ))}
    </TabsContent>
  );
};
