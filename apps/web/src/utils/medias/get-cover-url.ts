export const getCoverUrl = (mediaId: string, cover: { id: string }) =>
  `https://cdn.taiyo.moe/medias/${mediaId}/covers/${cover.id}.jpg`
