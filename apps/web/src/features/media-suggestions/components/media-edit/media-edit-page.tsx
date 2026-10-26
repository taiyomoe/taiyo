import { getRouteApi } from "@tanstack/react-router"
import { Suspense } from "react"
import { AppShell } from "@/components/shell/app-shell"
import { MediaEditForm } from "@/features/media-suggestions/components/media-edit/media-edit-form"

const routeApi = getRouteApi("/media/$mediaId_/edit")

export function MediaEditPage() {
  const { session } = routeApi.useRouteContext()
  const { mediaId } = routeApi.useParams()

  return (
    <AppShell user={session.user}>
      <Suspense>
        <MediaEditForm mediaId={mediaId} user={session.user} />
      </Suspense>
    </AppShell>
  )
}
