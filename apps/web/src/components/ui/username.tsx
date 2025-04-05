import type { Roles } from "@taiyomoe/db"
import type { HTMLAttributes } from "react"
import { tv } from "tailwind-variants"
import { Sparkles } from "~/components/ui/sparkles"
import { getName } from "~/utils/users/get-name"

const username = tv({
  base: "relative line-clamp-1 px-1 py-0.5 text-start",
  variants: {
    role: {
      USER: "",
      MODERATOR: "",
      UPLOADER_INTERN: "",
      UPLOADER: "",
      ADMIN: "text-brand brightness-70",
    },
  },
})

type Props = HTMLAttributes<HTMLSpanElement> & {
  user: {
    username: string
    displayUsername: string
    role: Roles
  }
}

export const Username = ({ user, className, ...props }: Props) => {
  const displayableName = getName(user)

  return (
    <span
      className={username({ className, role: user.role })}
      title={displayableName}
      {...props}
    >
      {user.role === "ADMIN" && (
        <Sparkles className="absolute top-0 left-0" speed={0.4} density={15} />
      )}
      {displayableName}
    </span>
  )
}
