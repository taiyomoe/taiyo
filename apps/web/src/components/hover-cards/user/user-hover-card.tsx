import type { Roles } from "@taiyomoe/db"
import Link from "next/link"
import { type HTMLAttributes, type RefObject, useRef } from "react"
import { useHover } from "usehooks-ts"
import { UserHoverCardContent } from "~/components/hover-cards/user/user-hover-card-content"
import { HoverCard, HoverCardTrigger } from "~/components/ui/hover-card"
import { Username } from "~/components/ui/username"

type Props = HTMLAttributes<HTMLAnchorElement> & {
  user: {
    id: string
    username: string
    displayUsername: string
    role: Roles
  }
}

export const UserHoverCard = ({ user, ...props }: Props) => {
  const triggerRef = useRef<HTMLAnchorElement>(null)
  const isHovered = useHover(triggerRef as RefObject<HTMLElement>)

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Link
          ref={triggerRef}
          href={`/users/${user.id}`}
          className="-my-0.5 -mx-1 line-clamp-1 w-fit break-all rounded-sm transition-colors hover:bg-subtle hover:text-default data-[state=open]:bg-subtle data-[state=open]:text-default"
          {...props}
        >
          <Username user={user} />
        </Link>
      </HoverCardTrigger>
      <UserHoverCardContent id={user.id} enabled={isHovered} />
    </HoverCard>
  )
}
