import { ScrollShadow } from "@nextui-org/scroll-shadow"
import { notFound } from "next/navigation"
import { api } from "~/trpc/server"

import { MediaLayout } from "./_components/layout/media-layout"
import { MediaLayoutActions } from "./_components/layout/media-layout-actions"
import { MediaLayoutTabs } from "./_components/layout/media-layout-tabs"

type Props = {
  params: { mediaId: string }
}

export default async function Page({ params }: Props) {
  const { mediaId } = params

  const media = await api.medias.getById(mediaId)

  if (!media) {
    return notFound()
  }

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
  )
}
