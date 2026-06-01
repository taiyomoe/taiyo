import type { Account } from "./models/account-model"
import type { Banner } from "./models/banner-model"
import type { ChapterToGroup } from "./models/chapter-to-group-model"
import type { Chapter } from "./models/chapter-model"
import type { Cover } from "./models/cover-model"
import type { Group } from "./models/group-model"
import type { Media } from "./models/media-model"
import type { Session } from "./models/session-model"
import type { StaffOnMedia } from "./models/staff-on-media-model"
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
  _chapterToGroups: ChapterToGroup
  _userFollows: UserFollow
  accounts: Account
  banners: Banner
  chapters: Chapter
  covers: Cover
  groups: Group
  medias: Media
  sessions: Session
  staffOnMedias: StaffOnMedia
  staffs: Staff
  tasks: Task
  titles: Title
  userHistories: UserHistory
  userLibraries: UserLibrary
  userProfiles: UserProfile
  users: User
  verifications: Verification
}
