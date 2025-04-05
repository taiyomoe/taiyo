export const getAvatarUrl = (user: { image: string | null }) =>
  user.image ?? "https://cdn.taiyo.moe/assets/default-avatar.png"
