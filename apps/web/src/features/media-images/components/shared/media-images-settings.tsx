import type { ReactNode } from "react"
// StyleX only compiles the `sx` props of files that import it.
// oxlint-disable-next-line no-unused-vars
import * as stylex from "@stylexjs/stylex"
import { ExternalLink } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Link } from "@tanstack/react-router"
import { managerStyles } from "@/features/media-images/components/shared/manager-styles"
import { MediaField, type MediaOption } from "@/features/uploads/components/upload/media-field"
import { m } from "@/paraglide/messages"

export function MediaImagesSettings({
  media,
  onMediaChange,
  children,
}: {
  media: MediaOption | null
  onMediaChange: (media: MediaOption | null) => void
  children: ReactNode
}) {
  return (
    <div sx={managerStyles.card}>
      <h2 sx={managerStyles.cardTitle}>{m.media_images_settings()}</h2>
      <MediaField invalid={false} onChange={onMediaChange} value={media} />
      {children}
      {media === null ? null : (
        <Button
          render={<Link params={{ mediaId: media.id }} to="/media/$mediaId" />}
          size="sm"
          variant="outline"
        >
          <ExternalLink />
          {m.media_images_view_title()}
        </Button>
      )}
    </div>
  )
}
