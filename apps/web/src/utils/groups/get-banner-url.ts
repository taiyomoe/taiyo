export const getBannerUrl = (group: { banner: string | null }) =>
  group.banner ?? "https://cdn.taiyo.moe/assets/default-group-banner.png"
