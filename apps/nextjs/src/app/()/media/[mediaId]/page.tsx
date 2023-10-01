import { ScrollShadow } from "@nextui-org/scroll-shadow";

import { serverApi } from "~/utils/serverApi";
import { MediaLayout } from "./_components/layout/MediaLayout";
import { MediaLayoutActions } from "./_components/layout/MediaLayoutActions";
import { MediaLayoutTabs } from "./_components/layout/MediaLayoutTabs";

export const runtime = "edge";

type Props = {
  params: { mediaId: string };
};

const MediaPage = async ({ params: { mediaId } }: Props) => {
  const media = await serverApi.medias.getMediaById(mediaId);

  return (
    <MediaLayout media={media}>
      <MediaLayoutActions media={media} />
      <ScrollShadow className="h-[234px] w-full p-3 xl:h-[208px]" hideScrollBar>
        <p>{media?.synopsis}</p>
      </ScrollShadow>
      <MediaLayoutTabs media={media} />
    </MediaLayout>
  );
};

export default MediaPage;
