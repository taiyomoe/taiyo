import { tv } from "@heroui/react"
import type { HomeLayout } from "@taiyomoe/db"
import type { LatestMedia } from "@taiyomoe/types"
import { CoverUtils } from "@taiyomoe/utils"
import { useAtomValue } from "jotai"
import Link from "next/link"
import { releasesLayoutAtom } from "~/atoms/homeLayout.atoms"
import { MediaImage } from "~/components/images/MediaImage"

const trendingMediasCard = tv({
  base: "relative max-h-[400px] min-h-[400px] select-none hover:cursor-pointer",
  slots: {
    height: "h-[400px]",
    width: "w-[280px]",
  },
  variants: {
    layout: {
      ROWS: {
        base: "lg:max-h-[498px] lg:min-h-[498px]",
        height: "lg:h-[498px]",
        width: "lg:w-[350px]",
      },
      COLUMNS: {},
    },
  },
})

type Props = {
  initialLayout: HomeLayout
  media: LatestMedia
}

export const TrendingMediasCard = ({ initialLayout, media }: Props) => {
  const releasesLayout = useAtomValue(releasesLayoutAtom)
  const slots = trendingMediasCard({ layout: releasesLayout ?? initialLayout })

  return (
    <Link key={media.id} href={`/media/${media.id}`} className={slots.base()}>
      <MediaImage
        src={CoverUtils.getUrl(media)}
        classNames={{
          wrapper: slots.height(),
          height: slots.height(),
          width: slots.width(),
        }}
        maxHeight={498}
        maxWidth={350}
        alt="media's cover"
        isZoomed
      />
    </Link>
  )
}
