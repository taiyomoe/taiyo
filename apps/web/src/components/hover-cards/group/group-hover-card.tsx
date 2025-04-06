import Link from "next/link"
import { type RefObject, useRef } from "react"
import { useHover } from "usehooks-ts"
import { HoverCard, HoverCardTrigger } from "~/components/ui/hover-card"
import { GroupsHoverCardContent } from "./groups-hover-card-content"

type Props = { group: { id: string; name: string } }

export const GroupHoverCard = ({ group }: Props) => {
  const triggerRef = useRef<HTMLAnchorElement>(null)
  const isHovered = useHover(triggerRef as RefObject<HTMLElement>)

  return (
    <HoverCard key={group.id}>
      <HoverCardTrigger asChild>
        <Link
          ref={triggerRef}
          href={`/groups/${group.id}`}
          className="-my-0.5 -mx-1 line-clamp-1 w-fit break-all rounded-sm px-1 py-0.5 transition-colors hover:bg-subtle hover:text-default data-[state=open]:bg-subtle data-[state=open]:text-default"
        >
          {group.name}
        </Link>
      </HoverCardTrigger>
      <GroupsHoverCardContent id={group.id} enabled={isHovered} />
    </HoverCard>
  )
}
