import type { Roles } from "@taiyomoe/db"
import type { HTMLAttributes } from "react"
import { cn } from "~/utils/cn"

type Props = HTMLAttributes<HTMLSpanElement> & {
  user: {
    name: string
    username?: string | null
    displayUsername?: string | null
  }
  role?: Roles
}

export const Username = ({ user, role, className, ...props }: Props) => {
  const displayableName = user.displayUsername ?? user.username ?? user.name

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
