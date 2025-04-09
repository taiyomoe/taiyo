export const getLogoUrl = (group: { logo: string | null }) =>
  group.logo ?? "https://cdn.taiyo.moe/assets/default-group-logo.png"
