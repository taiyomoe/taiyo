const getAvatarUrl = (user: { image: string | null }) =>
  user.image ?? "/default-user-avatar.png"

const getBannerUrl = (profile: { banner: string | null }) => {
  if (!profile.banner) return "/default-user-banner.png"

  return `https://cdn.taiyo.moe/users/banners/${profile.banner}`
}

export const UserUtils = {
  getAvatarUrl,
  getBannerUrl,
}
