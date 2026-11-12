import type { ContentRating, Language } from "@taiyomoe/db/constants"
// StyleX only compiles the `sx` props of files that import it.
// oxlint-disable-next-line no-unused-vars
import * as stylex from "@stylexjs/stylex"
import { Field, FieldDescription, FieldLabel } from "@taiyomoe/ui/components/ui/field"
import { getRouteApi } from "@tanstack/react-router"
import { useState } from "react"
import { LanguagePicker } from "@/components/fields/language-picker"
import { DashboardPage } from "@/components/layout/dashboard-page"
import { CoversManager } from "@/features/media-images/components/covers/covers-manager"
import { ContentRatingSelect } from "@/features/media-images/components/shared/content-rating-select"
import { managerStyles } from "@/features/media-images/components/shared/manager-styles"
import { MediaImagesSettings } from "@/features/media-images/components/shared/media-images-settings"
import { PickTitleEmpty } from "@/features/media-images/components/shared/pick-title-empty"
import { m } from "@/paraglide/messages"

const routeApi = getRouteApi("/dashboard/covers")

export function CoversPage() {
  const prefill = routeApi.useLoaderData()
  const navigate = routeApi.useNavigate()
  const [media, setMedia] = useState(prefill.media)
  const [language, setLanguage] = useState<Language>("ja")
  const [contentRating, setContentRating] = useState<ContentRating>("NORMAL")

  return (
    <DashboardPage subtitle={m.media_covers_dashboard_subtitle()} title={m.dashboard_nav_covers()}>
      <div sx={managerStyles.layout}>
        <MediaImagesSettings
          media={media}
          onMediaChange={(next) => {
            setMedia(next)
            void navigate({ replace: true, search: { mediaId: next?.id } })
          }}
        >
          <Field>
            <FieldLabel>{m.upload_language()}</FieldLabel>
            <LanguagePicker onChange={setLanguage} value={language} />
            <FieldDescription>{m.media_images_defaults_hint()}</FieldDescription>
          </Field>
          <Field>
            <FieldLabel>{m.media_images_content_rating()}</FieldLabel>
            <ContentRatingSelect onChange={setContentRating} value={contentRating} />
          </Field>
        </MediaImagesSettings>
        {media === null ? (
          <PickTitleEmpty description={m.media_covers_pick_description()} />
        ) : (
          <CoversManager
            key={media.id}
            contentRating={contentRating}
            language={language}
            mediaId={media.id}
            title={media.title}
          />
        )}
      </div>
    </DashboardPage>
  )
}
