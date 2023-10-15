const getAvailableRoles = () =>
  ["USER", "MODERATOR", "UPLOADER_INTERN", "UPLOADER", "ADMIN"] as const;

export const RoleUtils = {
  getAvailableRoles,
};
