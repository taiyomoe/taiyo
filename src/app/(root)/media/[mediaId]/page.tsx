import { ScrollShadow } from "@nextui-org/scroll-shadow";

import { mediaPaginationSchema } from "~/lib/schemas";
import { api } from "~/lib/trpc/server";

import { MediaActions } from "./_components/layout/actions/MediaActions";
import { MediaLayout } from "./_components/layout/MediaLayout";
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
      <MediaActions media={media} />
      <ScrollShadow className="h-[184px] py-3 lg:h-[202px]" hideScrollBar>
        <p>{media?.synopsis}</p>
      </ScrollShadow>
      <MediaLayoutTabs media={media} />
    </MediaLayout>
  );
};

export default MediaPage;
