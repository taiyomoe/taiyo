import { Image } from "@nextui-org/image"
import type { User } from "@taiyomoe/db"
import { UserUtils } from "@taiyomoe/utils"
import NextImage from "next/image"

type Props = {
  user: User
}

export const UserLayoutAvatar = ({ user }: Props) => {
  const url = UserUtils.getAvatarUrl(user)

  return (
    <Image
      as={NextImage}
      src={url}
      classNames={{
        wrapper: "min-w-[206px] size-[206px] !max-w-full bg-content1 flex",
        img: "!size-[200px] self-center justify-self-center",
      }}
      radius="full"
      alt="User's avatar"
      priority
      fill
    />
  )
}
