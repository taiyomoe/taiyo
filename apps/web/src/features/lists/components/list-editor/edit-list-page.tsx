import { CatchBoundary, getRouteApi } from "@tanstack/react-router"
import { Suspense } from "react"
import { PageBodySkeleton } from "@/components/layout/page-body-skeleton"
import { EditListForm } from "@/features/lists/components/list-editor/edit-list-form"
import { ListEditorShell } from "@/features/lists/components/list-editor/list-editor-shell"
import { ListError } from "@/features/lists/components/list-page/list-error"
import { m } from "@/paraglide/messages"

const routeApi = getRouteApi("/lists/$listId_/edit")

export function EditListPage() {
  const { session } = routeApi.useRouteContext()
  const { listId } = routeApi.useParams()

  return (
    <ListEditorShell title={m.list_editor_edit_title()} user={session.user}>
      <CatchBoundary errorComponent={ListError} getResetKey={() => listId}>
        <Suspense fallback={<PageBodySkeleton blocks={["24rem", "16rem"]} />}>
          <EditListForm listId={listId} viewerId={session.user.id} />
        </Suspense>
      </CatchBoundary>
    </ListEditorShell>
  )
}
