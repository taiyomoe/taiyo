import { getUserFollowersHandler } from "../handlers/get-user-followers.handler"
import { getUserFollowingHandler } from "../handlers/get-user-following.handler"
import { getUserSessionsHandler } from "../handlers/get-user-sessions.handler"
import { toggleUserFollowHandler } from "../handlers/toggle-user-follow.handler"
import { updateUserHistoryProgressionHandler } from "../handlers/update-user-history-progression.handler"
import { updateUserSettingsHandler } from "../handlers/update-user-settings.handler"
import { createTRPCRouter } from "../trpc"

export const usersRouter = createTRPCRouter({
  updateProgression: updateUserHistoryProgressionHandler,
  updateSettings: updateUserSettingsHandler,
  toggleFollow: toggleUserFollowHandler,
  getFollowers: getUserFollowersHandler,
  getFollowing: getUserFollowingHandler,
  getSessions: getUserSessionsHandler,
})
