import { Image } from "@nextui-org/image"
import type { UserFollower } from "@taiyomoe/types"
import { UserUtils } from "@taiyomoe/utils"
import NextImage from "next/image"
import Link from "next/link"
import { CountryFlag } from "~/components/ui/CountryFlag"

type Props = {
  user: UserFollower
}

export const UserFollowsTabCard = ({ user }: Props) => (
  <Link
    key={user.id}
    className="group flex w-full transition-transform hover:scale-105 hover:cursor-pointer md:w-[320px]"
    href={`/user/${user.id}`}
  >
    <Image
      as={NextImage}
      src={UserUtils.getAvatarUrl(user)}
      classNames={{
        wrapper: "z-10 min-w-16 rounded-full",
        img: "object-cover rounded-full",
      }}
      width={64}
      height={64}
      alt="Foto do usuário"
    />
    <div className="-ml-8 z-0 w-full rounded-large bg-content1 p-2 pl-10 group-hover:bg-content2">
      <div className="flex items-center gap-2">
        {user.profile.country && (
          <CountryFlag country={user.profile.country} size={24} />
        )}
        <p className="font-medium group-hover:underline">{user.name}</p>
      </div>
      <p className="line-clamp-1 break-all text-foreground-400">
        {user.profile.about}
      </p>
    </div>
  </Link>
)
