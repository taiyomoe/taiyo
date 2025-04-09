export const getBannerUrl = (profile: { banner: string | null }) =>
  profile.banner
    ? `https://cdn.taiyo.moe/users/banners/${profile.banner}`
    : "https://cdn.taiyo.moe/assets/default-banner.png"
