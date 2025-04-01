import type { Group } from "@taiyomoe/db"
import { UsersIcon } from "lucide-react"
import Link from "next/link"
import { type RefObject, useRef } from "react"
import { useHover } from "usehooks-ts"
import { GroupsHoverCardContent } from "~/components/hover-cards/groups-hover-card-content"
import { HoverCard, HoverCardTrigger } from "~/components/ui/hover-card"

type Props = {
  groups: Group[]
}
export const LatestReleasesCardGroups = ({ groups }: Props) => {
  if (groups.length === 0) return <div />

  return (
    <div className="flex items-center gap-2">
      <UsersIcon className="size-4 min-w-fit" />
      {groups.map((group) => {
        const triggerRef = useRef<HTMLAnchorElement>(null)
        const isHovered = useHover(triggerRef as RefObject<HTMLElement>)

        return (
          <HoverCard key={group.id}>
            <HoverCardTrigger asChild>
              <Link
                ref={triggerRef}
                href={`/groups/${group.id}`}
                className="-my-0.5 -mx-1 line-clamp-1 w-fit break-all rounded px-1 py-0.5 transition-colors hover:bg-subtle hover:text-default data-[state=open]:bg-subtle data-[state=open]:text-default"
              >
                {group.name}
              </Link>
            </HoverCardTrigger>
            <GroupsHoverCardContent id={group.id} enabled={isHovered} />
          </HoverCard>
        )
      })}
    </div>
  )
}
