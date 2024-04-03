import { Image } from "@nextui-org/image"
import type { MediaLimited } from "@taiyomoe/types"
import { MediaUtils } from "@taiyomoe/utils"
import { MediaCoverUtils } from "@taiyomoe/utils"
import NextImage from "next/image"
import { cn } from "~/lib/utils/cn"

type Props = {
  media: MediaLimited
}

export const MediaLayoutBanner = ({ media }: Props) => {
  const bannerUrl = MediaUtils.getBannerOrCoverUrl(media)
  const coverUrl = MediaCoverUtils.getUrl(media)

  return (
    <Image
      as={NextImage}
      src={bannerUrl}
      classNames={{
        wrapper:
          "!max-w-full w-full z-0 after:shadow-[0_-64px_48px_16px_inset_var(--background)]",
        img: cn(
          "h-[250px] w-full rounded-none object-cover blur-xs brightness-50 lg:h-[300px] xl:h-[350px]",
          {
            "blur-md": bannerUrl === coverUrl,
          },
        ),
      }}
      height={350}
      width={1200}
      alt="media's banner"
      priority
    />
  )
}
