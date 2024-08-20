import type { User, UserProfile, UserSetting } from "@prisma/client"

export type UserLimited = Pick<
  User,
  "id" | "createdAt" | "image" | "name" | "role"
> & {
  settings: Pick<UserSetting, "showFollowing" | "showLibrary">
  profile: Pick<
    UserProfile,
    "banner" | "birthDate" | "gender" | "city" | "country" | "about" | "points"
  >
} & {
  uploadsCount: number
  followersCount: number
  followingCount: number
}
