// StyleX only compiles the `sx` props of files that import it.
// oxlint-disable-next-line no-unused-vars
import * as stylex from "@stylexjs/stylex"
import { getRouteApi } from "@tanstack/react-router"
import { useState } from "react"
import { DashboardPage } from "@/components/layout/dashboard-page"
import { MangaDexSyncPanel } from "@/features/mangadex-sync/components/mangadex-sync-panel"
import { syncStyles } from "@/features/mangadex-sync/components/sync-styles"
import { managerStyles } from "@/features/media-images/components/shared/manager-styles"
import { MediaImagesSettings } from "@/features/media-images/components/shared/media-images-settings"
import { PickTitleEmpty } from "@/features/media-images/components/shared/pick-title-empty"
import { m } from "@/paraglide/messages"

const routeApi = getRouteApi("/dashboard/mangadex-sync")

export function MangaDexSyncPage() {
  const prefill = routeApi.useLoaderData()
  const navigate = routeApi.useNavigate()
  const [media, setMedia] = useState(prefill.media)

  return (
    <DashboardPage subtitle={m.mangadex_subtitle()} title={m.dashboard_nav_mangadex_sync()}>
      <div sx={managerStyles.layout}>
        <MediaImagesSettings
          media={media}
          onMediaChange={(next) => {
            setMedia(next)
            void navigate({ replace: true, search: { mediaId: next?.id } })
          }}
        >
          <p sx={syncStyles.muted}>{m.mangadex_settings_hint()}</p>
        </MediaImagesSettings>
        {media === null ? (
          <PickTitleEmpty description={m.mangadex_pick_description()} />
        ) : (
          <MangaDexSyncPanel key={media.id} mediaId={media.id} />
        )}
      </div>
    </DashboardPage>
  )
}
