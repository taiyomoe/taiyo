import { getRouteApi } from "@tanstack/react-router"
import { Suspense } from "react"
import { AppShell } from "@/components/shell/app-shell"
import { MediaPageContent } from "@/features/media/components/media-page/media-page-content"
import { MediaPageSkeleton } from "@/features/media/components/media-page/media-page-skeleton"
import { getPermissions } from "@/lib/permissions"

const routeApi = getRouteApi("/media/$mediaId")

export function MediaPage() {
  const { session } = routeApi.useRouteContext()
  const { mediaId } = routeApi.useParams()
  const user = session?.user ?? null

  return (
    <AppShell user={user}>
      <Suspense fallback={<MediaPageSkeleton />}>
        <MediaPageContent
          canEdit={user !== null && getPermissions(user)("media.update")}
          mediaId={mediaId}
          user={user}
        />
      </Suspense>
    </AppShell>
  )
}
