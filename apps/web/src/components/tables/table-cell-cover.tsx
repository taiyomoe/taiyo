import { CoverUtils } from "@taiyomoe/utils"
import { MediaImage } from "~/components/images/MediaImage"

type Props = {
  mediaId: string
  coverId: string
}

export const TableCellCover = ({ mediaId, coverId }: Props) => (
  <MediaImage
    src={CoverUtils.getUrl({ id: mediaId, coverId })}
    classNames={{
      height: "min-h-[100px] h-[100px]",
      width: "min-w-[70px] w-[70px]",
    }}
    maxHeight={100}
    maxWidth={70}
    alt="Media's cover"
  />
)
