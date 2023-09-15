"use client";

import { api } from "~/utils/api";
import { MediaLayout } from "./_components/layout/MediaLayout";
import { MediaLayoutActions } from "./_components/layout/MediaLayoutActions";
import { MediaLayoutTabs } from "./_components/layout/MediaLayoutTabs";

type Props = {
  params: { mediaId: string };
};

const MediaPage = ({ params: { mediaId } }: Props) => {
  const { data: media } = api.medias.getMediaById.useQuery(mediaId);

  return (
    <MediaLayout media={media}>
      <MediaLayoutActions media={media} />
      <div className="h-[208px] w-full bg-pink-900 bg-opacity-50 p-3">
        <p className="max-h-full overflow-hidden overflow-ellipsis">
          {media?.synopsis}
        </p>
      </div>
      <MediaLayoutTabs media={media} />
    </MediaLayout>
  );
};

export default MediaPage;
