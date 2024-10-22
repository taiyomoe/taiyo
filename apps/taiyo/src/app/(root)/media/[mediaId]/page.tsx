import { ScrollShadow } from "@nextui-org/scroll-shadow"
import { notFound } from "next/navigation"
import { api } from "~/trpc/server"

import { MediaUtils } from "@taiyomoe/utils"
import type { Metadata } from "next"
import { siteConfig } from "~/lib/config"
import { MediasService } from "~/services/medias.web-service"
import { MediaLayout } from "./_components/layout/media-layout"
import { MediaLayoutActions } from "./_components/layout/media-layout-actions"
import { MediaLayoutTabs } from "./_components/layout/media-layout-tabs"

type Props = {
  params: Promise<{ mediaId: string }>
}

export const generateMetadata = async (props: Props): Promise<Metadata> => {
  const { mediaId } = await props.params
  const media = await MediasService.getFull(mediaId)

  if (!media) {
    return {}
  }

  return {
    title: MediaUtils.getDisplayTitle(media.titles),
    description: media.synopsis,
    openGraph: {
      siteName: siteConfig.name,
      images: {
        url: `/api/og?mediaId=${mediaId}`,
        width: 1200,
        height: 630,
        alt: MediaUtils.getDisplayTitle(media.titles),
      },
    },
  }
}

export default async function Page(props: Props) {
  const { mediaId } = await props.params
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
