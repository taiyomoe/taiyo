import { useSuspenseQuery } from "@tanstack/react-query"
import { useDeferredValue } from "react"
import { listQueryOptions } from "@/features/lists/api/lists"
import { ListHeader } from "@/features/lists/components/list-page/list-header"
import { ListItems } from "@/features/lists/components/list-page/list-items"
import { useSettings } from "@/lib/settings"

export function ListContent({ listId, viewerId }: { listId: string; viewerId: string | null }) {
  const contentRatings = useDeferredValue(useSettings().contentRatings)
  const { data: list } = useSuspenseQuery(listQueryOptions(listId, contentRatings))
  const isOwner = viewerId === list.owner.id

  return (
    <>
      <ListHeader isOwner={isOwner} list={list} viewerId={viewerId} />
      <ListItems isOwner={isOwner} list={list} />
    </>
  )
}
