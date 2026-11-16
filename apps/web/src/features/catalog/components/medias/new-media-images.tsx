import type { ContentRating } from "@taiyomoe/db/constants"
import * as stylex from "@stylexjs/stylex"
import type { StagedImage } from "@/features/media-images/hooks/use-staged-images"
import type { StagedCoverFields } from "@/features/media-images/lib/staged-cover"
import { StagedBannerRow } from "@/features/media-images/components/banners/staged-banner-row"
import { StagedCoverRow } from "@/features/media-images/components/covers/staged-cover-row"
import { ImageDropZone } from "@/features/media-images/components/shared/image-drop-zone"
import { mediaEditStyles } from "@/features/media-suggestions/components/media-edit/media-edit-styles"
import { m } from "@/paraglide/messages"

type Staged<TFields extends object> = {
  items: Array<StagedImage<TFields>>
  rejected: string[]
  add: (files: readonly File[]) => void
  update: (key: string, patch: Partial<TFields>) => void
  updateAll: (patch: (item: StagedImage<TFields>) => Partial<TFields>) => void
  remove: (key: string) => void
}

const styles = stylex.create({
  title: {
    margin: 0,
    fontSize: "1rem",
    fontWeight: 600,
  },
  rows: {
    margin: 0,
    padding: 0,
    listStyle: "none",
  },
})

export function NewMediaCovers({
  staged,
  disabled,
}: {
  staged: Staged<StagedCoverFields>
  disabled: boolean
}) {
  return (
    <section sx={mediaEditStyles.card}>
      <h2 sx={styles.title}>{m.catalog_media_new_covers()}</h2>
      <ImageDropZone
        hint={m.media_covers_drop_hint()}
        onFiles={staged.add}
        rejected={staged.rejected}
        title={m.media_covers_drop_title()}
      />
      {staged.items.length === 0 ? null : (
        <ul sx={styles.rows}>
          {staged.items.map((item) => (
            <StagedCoverRow
              disabled={disabled}
              item={item}
              key={item.key}
              onChange={(patch) => {
                if (patch.main === true) {
                  staged.updateAll((other) => ({ main: other.key === item.key }))
                } else {
                  staged.update(item.key, patch)
                }
              }}
              onRemove={() => {
                staged.remove(item.key)
              }}
            />
          ))}
        </ul>
      )}
    </section>
  )
}

export function NewMediaBanners({
  staged,
  disabled,
}: {
  staged: Staged<{ contentRating: ContentRating }>
  disabled: boolean
}) {
  return (
    <section sx={mediaEditStyles.card}>
      <h2 sx={styles.title}>{m.catalog_media_new_banners()}</h2>
      <ImageDropZone
        hint={m.media_banners_drop_hint()}
        onFiles={staged.add}
        rejected={staged.rejected}
        title={m.media_banners_drop_title()}
      />
      {staged.items.length === 0 ? null : (
        <ul sx={styles.rows}>
          {staged.items.map((item) => (
            <StagedBannerRow
              disabled={disabled}
              item={item}
              key={item.key}
              onChange={(contentRating) => {
                staged.update(item.key, { contentRating })
              }}
              onRemove={() => {
                staged.remove(item.key)
              }}
            />
          ))}
        </ul>
      )}
    </section>
  )
}
