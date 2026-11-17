import { useSuspenseQuery } from "@tanstack/react-query"
import { Navigate } from "@tanstack/react-router"
import type { Session } from "@/lib/session"
import { listQueryOptions } from "@/features/lists/api/lists"
import { ListEditor } from "@/features/lists/components/list-editor/list-editor"
import { ALL_CONTENT_RATINGS } from "@/features/lists/lib/list-labels"
import { getPermissions } from "@/lib/permissions"

export function EditListForm({ listId, user }: { listId: string; user: Session["user"] }) {
  const { data: list } = useSuspenseQuery(listQueryOptions(listId, ALL_CONTENT_RATINGS))
  const can = getPermissions(user)
  const target = { userId: list.owner.id, visibility: list.visibility }

  if (!can("list.update", target)) {
    return <Navigate params={{ listId }} replace to="/lists/$listId" />
  }

  return (
    <ListEditor
      canDelete={can("list.delete", target)}
      list={list}
      owned={list.owner.id === user.id}
    />
  )
}
