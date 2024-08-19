const getAvatarUrl = (user: { image: string | null }) =>
  user.image ?? "https://mangadex.org/img/avatar.png"

const getBannerUrl = (user: { banner: string | null }) => {
  if (!user.banner) return "/default-user-banner.png"

  return `https://cdn.taiyo.moe/user-banners/${user.banner}`
}

export const UserUtils = {
  getAvatarUrl,
  getBannerUrl,
}
