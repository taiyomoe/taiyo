import type { Account } from "./models/account-model"
import type { Banner } from "./models/banner-model"
import type { ChapterGroup } from "./models/chapter-group-model"
import type { Chapter } from "./models/chapter-model"
import type { Cover } from "./models/cover-model"
import type { GroupMembership } from "./models/group-membership-model"
import type { Group } from "./models/group-model"
import type { GroupOwnershipRequest } from "./models/group-ownership-request-model"
import type { MediaStaff } from "./models/media-staff-model"
import type { Media } from "./models/media-model"
import type { Session } from "./models/session-model"
import type { Staff } from "./models/staff-model"
import type { Task } from "./models/task-model"
import type { Title } from "./models/title-model"
import type { UserFollow } from "./models/user-follow-model"
import type { UserHistory } from "./models/user-history-model"
import type { UserLibrary } from "./models/user-library-model"
import type { UserProfile } from "./models/user-profile-model"
import type { User } from "./models/user-model"
import type { Verification } from "./models/verification-model"

export interface DB {
  accounts: Account
  banners: Banner
  chapterGroups: ChapterGroup
  chapters: Chapter
  covers: Cover
  groupMemberships: GroupMembership
  groupOwnershipRequests: GroupOwnershipRequest
  groups: Group
  mediaStaffs: MediaStaff
  medias: Media
  sessions: Session
  staffs: Staff
  tasks: Task
  titles: Title
  userFollows: UserFollow
  userHistories: UserHistory
  userLibraries: UserLibrary
  userProfiles: UserProfile
  users: User
  verifications: Verification
}
