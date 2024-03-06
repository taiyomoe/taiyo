import { SearchedMedia } from "@taiyomoe/types"
import { MediaCoverUtils } from "@taiyomoe/utils"
import Image from "next/image"

type Props = {
  media: SearchedMedia
}

export const SearchedMediaCard = ({ media }: Props) => (
  <>
    <Image
      src={MediaCoverUtils.getUrl({
        id: media.id,
        coverId: media.coverId,
      })}
      className="h-full min-w-[60px] rounded-small object-fill"
      width={60}
      height={80}
      alt="media's cover"
    />
    <div className="h-full gap-1">
      <h3 className="line-clamp-1 text-lg font-semibold">{media.title}</h3>
      <p className="line-clamp-2 text-clip text-default-500">
        {media.synopsis}
      </p>
    </div>
  </>
)
