import { getRouteApi } from "@tanstack/react-router"
import { ListEditor } from "@/features/lists/components/list-editor/list-editor"
import { ListEditorShell } from "@/features/lists/components/list-editor/list-editor-shell"
import { m } from "@/paraglide/messages"

const routeApi = getRouteApi("/lists/new")

export function NewListPage() {
  const { session } = routeApi.useRouteContext()

  return (
    <ListEditorShell title={m.list_editor_new_title()} user={session.user}>
      <ListEditor list={null} />
    </ListEditorShell>
  )
}
