import { Hono } from "hono"
import { banUserHandler } from "../handlers/ban-user-handler"
import { createListHandler } from "../handlers/create-list-handler"
import { createProfileCommentHandler } from "../handlers/create-profile-comment-handler"
import { deleteChapterHistoryHandler } from "../handlers/delete-chapter-history-handler"
import { deleteMyAvatarHandler } from "../handlers/delete-my-avatar-handler"
import { deleteMyBannerHandler } from "../handlers/delete-my-banner-handler"
import { deleteProfileCommentHandler } from "../handlers/delete-profile-comment-handler"
import { followUserHandler } from "../handlers/follow-user-handler"
import { getLibraryEntryHandler } from "../handlers/get-library-entry-handler"
import { getMyCosmeticsHandler } from "../handlers/get-my-cosmetics-handler"
import { getMyOverviewHandler } from "../handlers/get-my-overview-handler"
import { getMyReaderSettingsHandler } from "../handlers/get-my-reader-settings-handler"
import { getReadingProgressHandler } from "../handlers/get-reading-progress-handler"
import { getUserProfileHandler } from "../handlers/get-user-profile-handler"
import { getUserStatsHandler } from "../handlers/get-user-stats-handler"
import { listFollowersHandler } from "../handlers/list-followers-handler"
import { listFollowingHandler } from "../handlers/list-following-handler"
import { listMyBookmarksHandler } from "../handlers/list-my-bookmarks-handler"
import { listMyChapterSubmissionsHandler } from "../handlers/list-my-chapter-submissions-handler"
import { listMyFeedHandler } from "../handlers/list-my-feed-handler"
import { listMyGroupCreationRequestsHandler } from "../handlers/list-my-group-creation-requests-handler"
import { listMyGroupInvitationsHandler } from "../handlers/list-my-group-invitations-handler"
import { listMyGroupsHandler } from "../handlers/list-my-groups-handler"
import { listMyHistoryHandler } from "../handlers/list-my-history-handler"
import { listMyLibraryHandler } from "../handlers/list-my-library-handler"
import { listMyListsHandler } from "../handlers/list-my-lists-handler"
import { listMyMediaSuggestionsHandler } from "../handlers/list-my-media-suggestions-handler"
import { listProfileCommentsHandler } from "../handlers/list-profile-comments-handler"
import { listUsersHandler } from "../handlers/list-users-handler"
import { removeLibraryEntryHandler } from "../handlers/remove-library-entry-handler"
import { setUserRoleHandler } from "../handlers/set-user-role-handler"
import { unbanUserHandler } from "../handlers/unban-user-handler"
import { unfollowUserHandler } from "../handlers/unfollow-user-handler"
import { updateMyReaderSettingsHandler } from "../handlers/update-my-reader-settings-handler"
import { updateMyAvatarHandler } from "../handlers/update-my-avatar-handler"
import { updateMyBannerHandler } from "../handlers/update-my-banner-handler"
import { updateMyCosmeticsHandler } from "../handlers/update-my-cosmetics-handler"
import { updateMyProfileHandler } from "../handlers/update-my-profile-handler"
import { updateMySettingsHandler } from "../handlers/update-my-settings-handler"
import { upsertLibraryEntryHandler } from "../handlers/upsert-library-entry-handler"

export const usersRouter = new Hono()
  .route("/", listUsersHandler)
  .route("/", getUserProfileHandler)
  .route("/", getMyOverviewHandler)
  .route("/", setUserRoleHandler)
  .route("/", banUserHandler)
  .route("/", unbanUserHandler)
  .route("/", followUserHandler)
  .route("/", unfollowUserHandler)
  .route("/", listFollowersHandler)
  .route("/", listFollowingHandler)
  .route("/", listMyHistoryHandler)
  .route("/", getReadingProgressHandler)
  .route("/", deleteChapterHistoryHandler)
  .route("/", getLibraryEntryHandler)
  .route("/", upsertLibraryEntryHandler)
  .route("/", removeLibraryEntryHandler)
  .route("/", listMyLibraryHandler)
  .route("/", listMyFeedHandler)
  .route("/", createListHandler)
  .route("/", listMyListsHandler)
  .route("/", updateMySettingsHandler)
  .route("/", getMyReaderSettingsHandler)
  .route("/", listMyBookmarksHandler)
  .route("/", updateMyReaderSettingsHandler)
  .route("/", listMyGroupsHandler)
  .route("/", listMyGroupInvitationsHandler)
  .route("/", listMyGroupCreationRequestsHandler)
  .route("/", listMyChapterSubmissionsHandler)
  .route("/", listMyMediaSuggestionsHandler)
  .route("/", updateMyProfileHandler)
  .route("/", getMyCosmeticsHandler)
  .route("/", updateMyCosmeticsHandler)
  .route("/", updateMyAvatarHandler)
  .route("/", deleteMyAvatarHandler)
  .route("/", updateMyBannerHandler)
  .route("/", deleteMyBannerHandler)
  .route("/", getUserStatsHandler)
  .route("/", listProfileCommentsHandler)
  .route("/", createProfileCommentHandler)
  .route("/", deleteProfileCommentHandler)
