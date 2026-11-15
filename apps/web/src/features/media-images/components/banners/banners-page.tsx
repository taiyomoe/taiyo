import type { ContentRating } from "@taiyomoe/db/constants"
// StyleX only compiles the `sx` props of files that import it.
// oxlint-disable-next-line no-unused-vars
import * as stylex from "@stylexjs/stylex"
import { Field, FieldDescription, FieldLabel } from "@taiyomoe/ui/components/ui/field"
import { getRouteApi } from "@tanstack/react-router"
import { useState } from "react"
import { DashboardPage } from "@/components/layout/dashboard-page"
import { BannersManager } from "@/features/media-images/components/banners/banners-manager"
import { ContentRatingSelect } from "@/features/media-images/components/shared/content-rating-select"
import { managerStyles } from "@/features/media-images/components/shared/manager-styles"
import { MediaImagesSettings } from "@/features/media-images/components/shared/media-images-settings"
import { PickTitleEmpty } from "@/features/media-images/components/shared/pick-title-empty"
import { m } from "@/paraglide/messages"

const routeApi = getRouteApi("/dashboard/banners")

export function BannersPage() {
  const prefill = routeApi.useLoaderData()
  const navigate = routeApi.useNavigate()
  const [media, setMedia] = useState(prefill.media)
  const [contentRating, setContentRating] = useState<ContentRating>("NORMAL")

  return (
    <DashboardPage
      subtitle={m.media_banners_dashboard_subtitle()}
      title={m.dashboard_nav_banners()}
    >
      <div sx={managerStyles.layout}>
        <MediaImagesSettings
          media={media}
          onMediaChange={(next) => {
            setMedia(next)
            void navigate({ replace: true, search: { mediaId: next?.id } })
          }}
        >
          <Field>
            <FieldLabel>{m.media_images_content_rating()}</FieldLabel>
            <ContentRatingSelect onChange={setContentRating} value={contentRating} />
            <FieldDescription>{m.media_images_defaults_hint()}</FieldDescription>
          </Field>
        </MediaImagesSettings>
        {media === null ? (
          <PickTitleEmpty description={m.media_banners_pick_description()} />
        ) : (
          <BannersManager
            key={media.id}
            contentRating={contentRating}
            mediaId={media.id}
            title={media.title}
          />
        )}
      </div>
    </DashboardPage>
  )
}
