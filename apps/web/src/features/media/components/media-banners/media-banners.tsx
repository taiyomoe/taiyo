import * as stylex from "@stylexjs/stylex"
import { Banner } from "@taiyomoe/ui/components/icons"
import { breakpoints } from "@taiyomoe/ui/styles/tokens.stylex"
import { useDeferredValue, useState } from "react"
import type { Media } from "@/features/media/api/medias"
import { ImageLightbox } from "@/features/media/components/image-lightbox/image-lightbox"
import { ManageImagesLink } from "@/features/media/components/manage-images-link"
import { BannerTile } from "@/features/media/components/media-banners/banner-tile"
import { MediaImagesEmpty } from "@/features/media/components/media-images-empty"
import { getBannerFileName } from "@/features/media/lib/media-images"
import { getMainTitle } from "@/features/media/lib/media-labels"
import { ContentFilterEmpty } from "@/features/settings/components/content-filter"
import { useSettings } from "@/lib/settings"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  root: {
    gap: "1.25rem",
    display: "flex",
    flexDirection: "column",
  },
  toolbar: {
    alignItems: "center",
    display: "flex",
    justifyContent: "flex-end",
  },
  grid: {
    margin: 0,
    padding: 0,
    gap: "1.25rem",
    listStyle: "none",
    display: "grid",
    gridTemplateColumns: {
      default: "minmax(0, 1fr)",
      [breakpoints.lg]: "repeat(2, minmax(0, 1fr))",
    },
  },
})

export function MediaBanners({ media, canManage }: { media: Media; canManage: boolean }) {
  const contentRatings = useDeferredValue(useSettings().contentRatings)
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const title = getMainTitle(media.titles) ?? ""
  const banners = media.banners.filter((banner) => contentRatings.includes(banner.contentRating))
  const manage = canManage ? (
    <ManageImagesLink kind="banners" label={m.media_banners_manage()} mediaId={media.id} />
  ) : null

  if (media.banners.length === 0) {
    return (
      <MediaImagesEmpty
        action={manage ?? undefined}
        description={m.media_banners_none_description()}
        icon={<Banner />}
        title={m.media_banners_none_title()}
      />
    )
  }

  if (banners.length === 0) {
    return (
      <ContentFilterEmpty
        description={m.media_banners_filtered_description()}
        title={m.media_banners_none_title()}
      />
    )
  }

  return (
    <div sx={styles.root}>
      {manage === null ? null : <div sx={styles.toolbar}>{manage}</div>}
      <ul sx={styles.grid}>
        {banners.map((banner, index) => (
          <li key={banner.id}>
            <BannerTile
              alt={title}
              banner={banner}
              onOpen={() => {
                setOpenIndex(index)
              }}
            />
          </li>
        ))}
      </ul>
      <ImageLightbox
        index={openIndex}
        items={banners.map((banner, index) => ({
          id: banner.id,
          url: banner.url,
          title: `${title} — ${m.media_banners_label({ number: index + 1 })}`,
          fileName: getBannerFileName(title, banner, index),
        }))}
        onClose={() => {
          setOpenIndex(null)
        }}
        onIndexChange={setOpenIndex}
      />
    </div>
  )
}
