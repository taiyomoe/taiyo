import type { UserSetting } from "@prisma/client"

export type UserSettings = Pick<
  UserSetting,
  | "contentRating"
  | "preferredTitles"
  | "showFollowing"
  | "showLibrary"
  | "homeLayout"
>
