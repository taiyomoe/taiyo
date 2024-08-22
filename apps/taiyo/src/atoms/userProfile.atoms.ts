import type { UserFollower } from "@taiyomoe/types"
import { atom } from "jotai"

export const userProfileFollowersCountAtom = atom(0)

export const userProfileOwnFollowerAtom = atom<UserFollower | undefined | null>(
  undefined,
)
