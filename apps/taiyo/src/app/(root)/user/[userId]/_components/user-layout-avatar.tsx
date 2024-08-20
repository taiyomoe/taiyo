import { Image } from "@nextui-org/image"
import type { UserLimited } from "@taiyomoe/types"
import { UserUtils } from "@taiyomoe/utils"
import NextImage from "next/image"

type Props = {
  user: UserLimited
}

export const UserLayoutAvatar = ({ user }: Props) => {
  const url = UserUtils.getAvatarUrl(user)

  return (
    <Image
      as={NextImage}
      src={url}
      classNames={{
        wrapper:
          "min-w-[126px] size-[126px] sm:min-w-[206px] sm:size-[206px] !max-w-full bg-content1 flex select-none",
        img: "!size-[120px] sm:!size-[200px] self-center justify-self-center",
      }}
      radius="full"
      alt="User's avatar"
      priority
      fill
    />
  )
}
