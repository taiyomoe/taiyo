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

export default async function Page({ params, searchParams }: Props) {
  const { mediaId } = params;

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
      <ScrollShadow
        className="h-[184px] py-3 lg:h-[234px] xl:h-[202px]"
        hideScrollBar
      >
        <p>{media?.synopsis}</p>
      </ScrollShadow>
      <MediaLayoutTabs media={media} />
    </MediaLayout>
  );
}
