import { getRouteApi } from "@tanstack/react-router"
import { Suspense } from "react"
import { DashboardPage } from "@/components/layout/dashboard-page"
import { PageBodySkeleton, PageEyebrowSkeleton } from "@/components/layout/page-body-skeleton"
import { AppShell } from "@/components/shell/app-shell"
import { MediaEditForm } from "@/features/media-suggestions/components/media-edit/media-edit-form"
import { getPermissions } from "@/lib/permissions"
import { m } from "@/paraglide/messages"

const routeApi = getRouteApi("/media/$mediaId_/edit")

export function MediaEditPage() {
  const { session } = routeApi.useRouteContext()
  const { mediaId } = routeApi.useParams()
  const direct = getPermissions(session.user)("media.update")

  return (
    <AppShell user={session.user}>
      <Suspense
        fallback={
          <DashboardPage
            eyebrow={<PageEyebrowSkeleton />}
            subtitle={direct ? m.media_edit_direct_subtitle() : m.media_edit_suggest_subtitle()}
            title={direct ? m.media_edit_direct_title() : m.media_edit_suggest_title()}
          >
            <PageBodySkeleton blocks={["22rem", "14rem", "14rem"]} />
          </DashboardPage>
        }
      >
        <MediaEditForm mediaId={mediaId} user={session.user} />
      </Suspense>
    </AppShell>
  )
}
