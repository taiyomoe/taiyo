import type { Roles } from "@taiyomoe/db"
import type { HTMLAttributes } from "react"
import { cn } from "~/utils/cn"

type Props = HTMLAttributes<HTMLSpanElement> & {
  user: {
    username?: string
    displayUsername?: string
  }
  role?: Roles
}

export const Username = ({ user, role, className, ...props }: Props) => {
  const displayableName = user.displayUsername ?? user.username

  return (
    <span
      className={cn("line-clamp-1 text-start", className)}
      title={displayableName}
      {...props}
    >
      {displayableName}
    </span>
  )
}
