import { serverApi } from "~/utils/serverApi";
import { MediaLayout } from "./_components/layout/MediaLayout";
import { MediaLayoutActions } from "./_components/layout/MediaLayoutActions";
import { MediaLayoutTabs } from "./_components/layout/MediaLayoutTabs";

type Props = {
  params: { mediaId: string };
};

const MediaPage = async ({ params: { mediaId } }: Props) => {
  const media = await serverApi.medias.getMediaById(mediaId);

  return (
    <MediaLayout media={media}>
      <MediaLayoutActions media={media} />
      <div className="h-[234px] w-full bg-pink-900 bg-opacity-50 p-3 xl:h-[208px]">
        <p className="max-h-full overflow-hidden overflow-ellipsis">
          {media?.synopsis}
        </p>
      </div>
      <MediaLayoutTabs media={media} />
    </MediaLayout>
  );
};

export default MediaPage;
