import { env } from "../env"

const getUrl = (media: { id: string; bannerId: string }) =>
  `${env.NEXT_PUBLIC_CDN_URL}/medias/${media.id}/banners/${media.bannerId}.jpg`

export const MediaBannerUtils = {
  getUrl,
}
