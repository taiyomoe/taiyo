import { Hono } from "hono"
import { addUsersPointsHandler } from "../handlers/add-users-points-handler"
import { banUserHandler } from "../handlers/ban-user-handler"
import { createListHandler } from "../handlers/create-list-handler"
import { createUserReportHandler } from "../handlers/create-user-report-handler"
import { deleteChapterHistoryHandler } from "../handlers/delete-chapter-history-handler"
import { deleteMyAvatarHandler } from "../handlers/delete-my-avatar-handler"
import { deleteMyBannerHandler } from "../handlers/delete-my-banner-handler"
import { deleteMyNotificationsHandler } from "../handlers/delete-my-notifications-handler"
import { deletePushSubscriptionHandler } from "../handlers/delete-push-subscription-handler"
import { deleteUserAvatarHandler } from "../handlers/delete-user-avatar-handler"
import { deleteUserBannerHandler } from "../handlers/delete-user-banner-handler"
import { followUserHandler } from "../handlers/follow-user-handler"
import { getLibraryEntryHandler } from "../handlers/get-library-entry-handler"
import { getMyCosmeticsHandler } from "../handlers/get-my-cosmetics-handler"
import { getMyLibraryCountsHandler } from "../handlers/get-my-library-counts-handler"
import { getMyNotificationCountsHandler } from "../handlers/get-my-notification-counts-handler"
import { getMyOverviewHandler } from "../handlers/get-my-overview-handler"
import { getMyReaderSettingsHandler } from "../handlers/get-my-reader-settings-handler"
import { getPushPublicKeyHandler } from "../handlers/get-push-public-key-handler"
import { getReadingProgressHandler } from "../handlers/get-reading-progress-handler"
import { getUserProfileHandler } from "../handlers/get-user-profile-handler"
import { getUserStatsHandler } from "../handlers/get-user-stats-handler"
import { grantUsersCosmeticHandler } from "../handlers/grant-users-cosmetic-handler"
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
import { listMyNotificationsHandler } from "../handlers/list-my-notifications-handler"
import { listUserAchievementsHandler } from "../handlers/list-user-achievements-handler"
import { listUserListsHandler } from "../handlers/list-user-lists-handler"
import { listUserReadingHistoryHandler } from "../handlers/list-user-reading-history-handler"
import { listUserReviewsHandler } from "../handlers/list-user-reviews-handler"
import { listUsersHandler } from "../handlers/list-users-handler"
import { readAllMyNotificationsHandler } from "../handlers/read-all-my-notifications-handler"
import { readMyNotificationHandler } from "../handlers/read-my-notification-handler"
import { removeLibraryEntryHandler } from "../handlers/remove-library-entry-handler"
import { setMyPasswordHandler } from "../handlers/set-my-password-handler"
import { setUserRoleHandler } from "../handlers/set-user-role-handler"
import { setUsersRoleHandler } from "../handlers/set-users-role-handler"
import { streamMyNotificationsHandler } from "../handlers/stream-my-notifications-handler"
import { testPushSubscriptionHandler } from "../handlers/test-push-subscription-handler"
import { unbanUserHandler } from "../handlers/unban-user-handler"
import { unfollowUserHandler } from "../handlers/unfollow-user-handler"
import { updateMyAccountHandler } from "../handlers/update-my-account-handler"
import { updateMyAvatarHandler } from "../handlers/update-my-avatar-handler"
import { updateMyBannerHandler } from "../handlers/update-my-banner-handler"
import { updateMyCosmeticsHandler } from "../handlers/update-my-cosmetics-handler"
import { updateMyNotificationsHandler } from "../handlers/update-my-notifications-handler"
import { updateMyProfileHandler } from "../handlers/update-my-profile-handler"
import { updateMyReaderSettingsHandler } from "../handlers/update-my-reader-settings-handler"
import { updateMySettingsHandler } from "../handlers/update-my-settings-handler"
import { updateUserProfileHandler } from "../handlers/update-user-profile-handler"
import { upsertLibraryEntryHandler } from "../handlers/upsert-library-entry-handler"
import { upsertPushSubscriptionHandler } from "../handlers/upsert-push-subscription-handler"

export const usersRouter = new Hono()
  .route("/", listUsersHandler)
  .route("/", setUsersRoleHandler)
  .route("/", addUsersPointsHandler)
  .route("/", grantUsersCosmeticHandler)
  .route("/", getUserProfileHandler)
  .route("/", getMyOverviewHandler)
  .route("/", setUserRoleHandler)
  .route("/", banUserHandler)
  .route("/", unbanUserHandler)
  .route("/", createUserReportHandler)
  .route("/", followUserHandler)
  .route("/", unfollowUserHandler)
  .route("/", listFollowersHandler)
  .route("/", listUserReviewsHandler)
  .route("/", listFollowingHandler)
  .route("/", listMyHistoryHandler)
  .route("/", getReadingProgressHandler)
  .route("/", deleteChapterHistoryHandler)
  .route("/", getMyLibraryCountsHandler)
  .route("/", getLibraryEntryHandler)
  .route("/", upsertLibraryEntryHandler)
  .route("/", removeLibraryEntryHandler)
  .route("/", listMyLibraryHandler)
  .route("/", listMyFeedHandler)
  .route("/", listMyNotificationsHandler)
  .route("/", getMyNotificationCountsHandler)
  .route("/", readAllMyNotificationsHandler)
  .route("/", readMyNotificationHandler)
  .route("/", updateMyNotificationsHandler)
  .route("/", deleteMyNotificationsHandler)
  .route("/", streamMyNotificationsHandler)
  .route("/", getPushPublicKeyHandler)
  .route("/", upsertPushSubscriptionHandler)
  .route("/", deletePushSubscriptionHandler)
  .route("/", testPushSubscriptionHandler)
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
  .route("/", updateMyAccountHandler)
  .route("/", setMyPasswordHandler)
  .route("/", getMyCosmeticsHandler)
  .route("/", updateMyCosmeticsHandler)
  .route("/", updateMyAvatarHandler)
  .route("/", deleteMyAvatarHandler)
  .route("/", updateMyBannerHandler)
  .route("/", deleteMyBannerHandler)
  // After the `/me/...` routes, which `/:id/...` would otherwise catch.
  .route("/", updateUserProfileHandler)
  .route("/", deleteUserAvatarHandler)
  .route("/", deleteUserBannerHandler)
  .route("/", getUserStatsHandler)
  .route("/", listUserReadingHistoryHandler)
  .route("/", listUserListsHandler)
  .route("/", listUserAchievementsHandler)
