export type Roles =
  | "USER"
  | "MODERATOR"
  | "UPLOADER_INTERN"
  | "UPLOADER"
  | "ADMIN";

export enum RolesEnum {
  USER = "USER",
  MODERATOR = "MODERATOR",
  UPLOADER_INTERN = "UPLOADER_INTERN",
  UPLOADER = "UPLOADER",
  ADMIN = "ADMIN",
}

export const getAvailableRoles = () =>
  ["USER", "MODERATOR", "UPLOADER_INTERN", "UPLOADER", "ADMIN"] as const;
