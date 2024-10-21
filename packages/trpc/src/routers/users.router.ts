import { getUserFollowersHandler } from "../handlers/get-user-followers.handler"
import { getUserFollowingHandler } from "../handlers/get-user-following.handler"
import { toggleUserFollowHandler } from "../handlers/toggle-user-follow.handler"
import { updateUserSettingsHandler } from "../handlers/update-user-settings.handler"
import { createTRPCRouter } from "../trpc"

export const usersRouter = createTRPCRouter({
  updateSettings: updateUserSettingsHandler,
  toggleFollow: toggleUserFollowHandler,
  getFollowers: getUserFollowersHandler,
  getFollowing: getUserFollowingHandler,
})
