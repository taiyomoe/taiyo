import type { User, UserProfile, UserSetting } from "@prisma/client"

export type UserTabs = "info" | "uploads" | "followers" | "following"

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
  followingCount: number | null
}

export type UserFollower = Pick<User, "id" | "name" | "image"> & {
  profile: Pick<UserProfile, "about" | "country">
}
