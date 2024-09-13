import { UserUtils } from "@taiyomoe/utils"
import Image from "next/image"
import Link from "next/link"
import { CopyText } from "~/components/generics/texts/copy-text"

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
    <div className="flex items-center gap-2">
      <Link
        href={`/user/${user.id}`}
        className="flex items-center gap-2"
        target="_blank"
      >
        <Image
          src={UserUtils.getAvatarUrl(user)}
          className="rounded-full"
          width={24}
          height={24}
          alt={user.name ?? "User avatar"}
        />
        <p className="font-medium underline underline-offset-4 transition-colors hover:text-foreground-400">
          {user.name}
        </p>
      </Link>
      <CopyText text={user.id} />
    </div>
  )
}
