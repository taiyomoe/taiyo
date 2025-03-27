export const getBannerUrl = (mediaId: string, banner: { id: string }) => {
  return `https://cdn.taiyo.moe/medias/${mediaId}/banners/${banner.id}.jpg`
}
