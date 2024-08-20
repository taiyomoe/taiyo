import { Image } from "@nextui-org/image"
import type { UserLimited } from "@taiyomoe/types"
import { UserUtils } from "@taiyomoe/utils"
import NextImage from "next/image"

type Props = {
  user: UserLimited
}

export const UserLayoutBanner = ({ user }: Props) => {
  const url = UserUtils.getBannerUrl(user.profile)

  return (
    <Image
      as={NextImage}
      src={url}
      classNames={{
        wrapper:
          "h-mediasBannerContent rounded-none w-full !max-w-full after:absolute after:-bottom-[3px] after:left-0 after:h-0.5 after:w-full after:bg-primary z-0 select-none",
        img: "rounded-none object-cover blur-xs brightness-75",
      }}
      alt="User's banner"
      priority
      fill
    />
  )
}
