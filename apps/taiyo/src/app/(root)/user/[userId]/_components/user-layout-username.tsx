import { tv } from "@nextui-org/react"
import type { UserLimited } from "@taiyomoe/types"
import { CountryFlag } from "~/components/ui/CountryFlag"

type Props = {
  user: UserLimited
}

const userLayoutUsername = tv({
  base: "!leading-tight line-clamp-1 w-full break-all font-semibold text-2xl drop-shadow-accent md:text-3xl lg:text-4xl xl:text-5xl",
  variants: {
    role: {
      USER: "",
      MODERATOR: "",
      UPLOADER_INTERN: "",
      UPLOADER: "",
      ADMIN: "text-primary",
    },
  },
})

export const UserLayoutUsername = ({ user }: Props) => {
  const base = userLayoutUsername({ role: user.role })

  if (!user.name) {
    return <p className={base}>Ghost</p>
  }

  return (
    <div className="flex items-center gap-4">
      {user.profile.country && (
        <CountryFlag country={user.profile.country} size={38} />
      )}
      <p className={base}>{user.name}</p>
    </div>
  )
}
