import { ScrollShadow } from "@nextui-org/scroll-shadow";

import { mediaPaginationSchema } from "~/lib/schemas";
import { api } from "~/lib/trpc/server";
import { MediaLayout } from "./_components/layout/MediaLayout";
import { MediaLayoutActions } from "./_components/layout/MediaLayoutActions";
import { MediaLayoutTabs } from "./_components/layout/MediaLayoutTabs";

type Props = {
  params: { mediaId: string };
  searchParams: Record<string, string | string[] | undefined>;
};

const MediaPage = async ({ params: { mediaId }, searchParams }: Props) => {
  const pagination = mediaPaginationSchema.parse({
    page: searchParams.page,
    perPage: searchParams.per_page,
  });

  const media = await api.medias.getById.query({
    id: mediaId,
    page: pagination.page,
    perPage: pagination.perPage,
  });

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
