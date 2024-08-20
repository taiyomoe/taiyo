import { tv } from "@nextui-org/react"
import type { UserLimited } from "@taiyomoe/types"

type Props = {
  user: UserLimited
}

const userLayoutUsername = tv({
  base: "!leading-normal w-full overflow-hidden text-ellipsis font-semibold text-2xl drop-shadow-accent md:text-3xl lg:text-4xl xl:text-5xl",
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

  return <p className={base}>{user.name}</p>
}
