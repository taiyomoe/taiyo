import type { Account } from "./models/account-model"
import type { AuditLog } from "./models/audit-log-model"
import type { Banner } from "./models/banner-model"
import type { ChapterGroup } from "./models/chapter-group-model"
import type { Chapter } from "./models/chapter-model"
import type { Cover } from "./models/cover-model"
import type { FeaturedMedia } from "./models/featured-media-model"
import type { GroupCreationRequest } from "./models/group-creation-request-model"
import type { GroupInvitation } from "./models/group-invitation-model"
import type { GroupMembership } from "./models/group-membership-model"
import type { Group } from "./models/group-model"
import type { GroupOwnershipRequest } from "./models/group-ownership-request-model"
import type { Media } from "./models/media-model"
import type { MediaStaff } from "./models/media-staff-model"
import type { MediaSuggestion } from "./models/media-suggestion-model"
import type { PageBookmark } from "./models/page-bookmark-model"
import type { PageReport } from "./models/page-report-model"
import type { ReadingReward } from "./models/reading-reward-model"
import type { SearchOutboxEntry } from "./models/search-outbox-model"
import type { Session } from "./models/session-model"
import type { Staff } from "./models/staff-model"
import type { Task } from "./models/task-model"
import type { Title } from "./models/title-model"
import type { UserCosmetic } from "./models/user-cosmetic-model"
import type { UserFollow } from "./models/user-follow-model"
import type { UserHistory } from "./models/user-history-model"
import type { UserLibraryEntry } from "./models/user-library-entry-model"
import type { UserListItem } from "./models/user-list-item-model"
import type { UserList } from "./models/user-list-model"
import type { User } from "./models/user-model"
import type { UserProfileComment } from "./models/user-profile-comment-model"
import type { UserProfile } from "./models/user-profile-model"
import type { Verification } from "./models/verification-model"

export type DB = {
  accounts: Account
  auditLogs: AuditLog
  banners: Banner
  chapterGroups: ChapterGroup
  chapters: Chapter
  covers: Cover
  featuredMedias: FeaturedMedia
  groupCreationRequests: GroupCreationRequest
  groupInvitations: GroupInvitation
  groupMemberships: GroupMembership
  groupOwnershipRequests: GroupOwnershipRequest
  groups: Group
  mediaStaffs: MediaStaff
  mediaSuggestions: MediaSuggestion
  medias: Media
  pageBookmarks: PageBookmark
  pageReports: PageReport
  readingRewards: ReadingReward
  searchOutbox: SearchOutboxEntry
  sessions: Session
  staffs: Staff
  tasks: Task
  titles: Title
  userCosmetics: UserCosmetic
  userFollows: UserFollow
  userHistories: UserHistory
  userLibraryEntries: UserLibraryEntry
  userListItems: UserListItem
  userLists: UserList
  userProfileComments: UserProfileComment
  userProfiles: UserProfile
  users: User
  verifications: Verification
}
