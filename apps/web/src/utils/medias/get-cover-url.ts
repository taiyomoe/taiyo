export const getCoverUrl = (mediaId: string, cover: { id: string }) => {
  return `https://cdn.taiyo.moe/medias/${mediaId}/covers/${cover.id}.jpg`
}
