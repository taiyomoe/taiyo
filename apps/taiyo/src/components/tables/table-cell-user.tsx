import { UserUtils } from "@taiyomoe/utils"
import Image from "next/image"
import Link from "next/link"

type Props = {
  user: {
    id: string
    name: string | null
    image: string | null
  } | null
}

export const TableCellUser = ({ user }: Props) => {
  if (!user) return null

  return (
    <Link href={`/user/${user.id}`} className="flex items-center gap-2">
      <Image
        src={UserUtils.getAvatarUrl(user)}
        className="rounded-full"
        width={24}
        height={24}
        alt={user.name ?? "User avatar"}
      />
      <p className="font-medium">{user.name}</p>
    </Link>
  )
}
