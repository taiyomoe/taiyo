import { ScrollShadow } from "@nextui-org/scroll-shadow"
import { notFound } from "next/navigation"
import { api } from "~/trpc/server"

import { MediasService } from "@taiyomoe/services"
import { MediaUtils } from "@taiyomoe/utils"
import type { Metadata } from "next"
import { siteConfig } from "~/lib/config"
import { MediaLayout } from "./_components/layout/media-layout"
import { MediaLayoutActions } from "./_components/layout/media-layout-actions"
import { MediaLayoutTabs } from "./_components/layout/media-layout-tabs"

type Props = {
  params: { mediaId: string }
}

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const media = await MediasService.getFull(params.mediaId)

  if (!media) {
    return {}
  }

  return {
    title: MediaUtils.getDisplayTitle(media.titles),
    description: media.synopsis,
    openGraph: {
      siteName: siteConfig.name,
      images: {
        url: `/api/og?mediaId=${params.mediaId}`,
        width: 1200,
        height: 630,
        alt: MediaUtils.getDisplayTitle(media.titles),
      },
    },
  }
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
