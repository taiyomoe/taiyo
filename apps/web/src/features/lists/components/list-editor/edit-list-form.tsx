import { useSuspenseQuery } from "@tanstack/react-query"
import { Navigate } from "@tanstack/react-router"
import { listQueryOptions } from "@/features/lists/api/lists"
import { ListEditor } from "@/features/lists/components/list-editor/list-editor"
import { ALL_CONTENT_RATINGS } from "@/features/lists/lib/list-labels"

export function EditListForm({ listId, viewerId }: { listId: string; viewerId: string }) {
  const { data: list } = useSuspenseQuery(listQueryOptions(listId, ALL_CONTENT_RATINGS))

  if (list.owner.id !== viewerId) {
    return <Navigate params={{ listId }} replace to="/lists/$listId" />
  }

  return <ListEditor list={list} />
}
