import type { Account } from "./models/account-model"
import type { AuditLog } from "./models/audit-log-model"
import type { Banner } from "./models/banner-model"
import type { BlockedCommentImage } from "./models/blocked-comment-image-model"
import type { ChapterGroup } from "./models/chapter-group-model"
import type { Chapter } from "./models/chapter-model"
import type { CommentImageFavorite } from "./models/comment-image-favorite-model"
import type { CommentImage } from "./models/comment-image-model"
import type { CommentImageUsage } from "./models/comment-image-usage-model"
import type { Comment } from "./models/comment-model"
import type { CommentReport } from "./models/comment-report-model"
import type { CommentRevision } from "./models/comment-revision-model"
import type { CommentThread } from "./models/comment-thread-model"
import type { CommentVote } from "./models/comment-vote-model"
import type { Cover } from "./models/cover-model"
import type { FeaturedMedia } from "./models/featured-media-model"
import type { GroupCreationRequest } from "./models/group-creation-request-model"
import type { GroupFollow } from "./models/group-follow-model"
import type { GroupInvitation } from "./models/group-invitation-model"
import type { GroupMembership } from "./models/group-membership-model"
import type { Group } from "./models/group-model"
import type { GroupOwnershipRequest } from "./models/group-ownership-request-model"
import type { GroupReport } from "./models/group-report-model"
import type { Media } from "./models/media-model"
import type { MediaStaff } from "./models/media-staff-model"
import type { MediaSuggestion } from "./models/media-suggestion-model"
import type { Notification } from "./models/notification-model"
import type { NotificationOutboxEntry } from "./models/notification-outbox-model"
import type { PageBookmark } from "./models/page-bookmark-model"
import type { PageReport } from "./models/page-report-model"
import type { ReadingReward } from "./models/reading-reward-model"
import type { SearchOutboxEntry } from "./models/search-outbox-model"
import type { Session } from "./models/session-model"
import type { ShopPurchase } from "./models/shop-purchase-model"
import type { Staff } from "./models/staff-model"
import type { Task } from "./models/task-model"
import type { Title } from "./models/title-model"
import type { TwoFactor } from "./models/two-factor-model"
import type { UserCosmetic } from "./models/user-cosmetic-model"
import type { UserFollow } from "./models/user-follow-model"
import type { UserHistory } from "./models/user-history-model"
import type { UserLibraryEntry } from "./models/user-library-entry-model"
import type { UserListItem } from "./models/user-list-item-model"
import type { UserList } from "./models/user-list-model"
import type { User } from "./models/user-model"
import type { UserProfile } from "./models/user-profile-model"
import type { Verification } from "./models/verification-model"

export type DB = {
  accounts: Account
  auditLogs: AuditLog
  banners: Banner
  chapterGroups: ChapterGroup
  chapters: Chapter
  blockedCommentImages: BlockedCommentImage
  commentImageFavorites: CommentImageFavorite
  commentImageUsages: CommentImageUsage
  commentImages: CommentImage
  commentReports: CommentReport
  commentRevisions: CommentRevision
  commentThreads: CommentThread
  commentVotes: CommentVote
  comments: Comment
  covers: Cover
  featuredMedias: FeaturedMedia
  groupCreationRequests: GroupCreationRequest
  groupFollows: GroupFollow
  groupInvitations: GroupInvitation
  groupMemberships: GroupMembership
  groupOwnershipRequests: GroupOwnershipRequest
  groupReports: GroupReport
  groups: Group
  mediaStaffs: MediaStaff
  mediaSuggestions: MediaSuggestion
  medias: Media
  notificationOutbox: NotificationOutboxEntry
  notifications: Notification
  pageBookmarks: PageBookmark
  pageReports: PageReport
  readingRewards: ReadingReward
  searchOutbox: SearchOutboxEntry
  sessions: Session
  shopPurchases: ShopPurchase
  staffs: Staff
  tasks: Task
  titles: Title
  twoFactors: TwoFactor
  userCosmetics: UserCosmetic
  userFollows: UserFollow
  userHistories: UserHistory
  userLibraryEntries: UserLibraryEntry
  userListItems: UserListItem
  userLists: UserList
  userProfiles: UserProfile
  users: User
  verifications: Verification
}
