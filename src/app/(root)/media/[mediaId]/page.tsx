import { ScrollShadow } from "@nextui-org/scroll-shadow";

import { api } from "~/lib/trpc/server";

import { MediaLayout } from "./_components/layout/MediaLayout";
import { MediaLayoutActions } from "./_components/layout/MediaLayoutActions";
import { MediaLayoutTabs } from "./_components/layout/MediaLayoutTabs";

type Props = {
  params: { mediaId: string };
};

export default async function Page({ params }: Props) {
  const { mediaId } = params;

  const media = await api.medias.getById.query(mediaId);

  return (
    <MediaLayout media={media}>
      <MediaLayoutActions media={media} />
      <ScrollShadow
        className="h-[184px] py-3 lg:h-[264px] xl:h-[232px]"
        hideScrollBar
      >
        <p>{media?.synopsis}</p>
      </ScrollShadow>
      <MediaLayoutTabs media={media} />
    </MediaLayout>
  );
}
