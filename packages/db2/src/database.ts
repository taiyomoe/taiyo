import type { Accounts } from "./models/accounts-model"
import type { Banners } from "./models/banners-model"
import type { ChapterToGroups } from "./models/chapter-to-groups-model"
import type { Chapters } from "./models/chapters-model"
import type { Covers } from "./models/covers-model"
import type { Groups } from "./models/groups-model"
import type { Medias } from "./models/medias-model"
import type { Sessions } from "./models/sessions-model"
import type { StaffOnMedias } from "./models/staff-on-medias-model"
import type { Staffs } from "./models/staffs-model"
import type { Tasks } from "./models/tasks-model"
import type { Titles } from "./models/titles-model"
import type { UserFollows } from "./models/user-follows-model"
import type { UserHistories } from "./models/user-histories-model"
import type { UserLibraries } from "./models/user-libraries-model"
import type { UserProfiles } from "./models/user-profiles-model"
import type { Users } from "./models/users-model"
import type { Verifications } from "./models/verifications-model"

export interface DB {
  _chapterToGroups: ChapterToGroups
  _userFollows: UserFollows
  accounts: Accounts
  banners: Banners
  chapters: Chapters
  covers: Covers
  groups: Groups
  medias: Medias
  sessions: Sessions
  staffOnMedias: StaffOnMedias
  staffs: Staffs
  tasks: Tasks
  titles: Titles
  userHistories: UserHistories
  userLibraries: UserLibraries
  userProfiles: UserProfiles
  users: Users
  verifications: Verifications
}
