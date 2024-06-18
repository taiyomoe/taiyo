import { Image } from "@nextui-org/image"
import type { MediaLimited } from "@taiyomoe/types"
import { CoverUtils } from "@taiyomoe/utils"
import NextImage from "next/image"

type Props = {
  media: MediaLimited
}

export const MediaLayoutCover = ({ media }: Props) => {
  const coverUrl = CoverUtils.getUrl(media)

  return (
    <Image
      as={NextImage}
      classNames={{
        img: "cover-url h-[350px] min-w-[250px] w-[250px] lg:h-[430px] lg:min-w-[300px] object-fill",
      }}
      width={300}
      height={400}
      src={coverUrl}
      alt="media's cover"
      priority
      isBlurred
    />
  )
}
