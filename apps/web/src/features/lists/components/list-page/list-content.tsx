import { useSuspenseQuery } from "@tanstack/react-query"
import { useDeferredValue } from "react"
import type { Session } from "@/lib/session"
import { listQueryOptions } from "@/features/lists/api/lists"
import { ListHeader } from "@/features/lists/components/list-page/list-header"
import { ListItems } from "@/features/lists/components/list-page/list-items"
import { getPermissions } from "@/lib/permissions"
import { useSettings } from "@/lib/settings"

export function ListContent({ listId, user }: { listId: string; user: Session["user"] | null }) {
  const contentRatings = useDeferredValue(useSettings().contentRatings)
  const { data: list } = useSuspenseQuery(listQueryOptions(listId, contentRatings))
  const viewerId = user?.id ?? null
  const canEdit = getPermissions(user)("list.update", {
    userId: list.owner.id,
    visibility: list.visibility,
  })

  return (
    <>
      <ListHeader canEdit={canEdit} list={list} viewerId={viewerId} />
      <ListItems isOwner={viewerId === list.owner.id} list={list} />
    </>
  )
}
