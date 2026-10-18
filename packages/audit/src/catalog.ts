import { defineAuditCatalog } from "evlog"

export const authAudit = defineAuditCatalog("auth", {
  SIGN_UP: { target: "user", severity: "medium" },
  SIGN_IN: { target: "user", severity: "medium" },
  SIGN_OUT: { target: "user", severity: "low" },
  SOCIAL_SIGN_IN_START: { severity: "low" },
  MAGIC_LINK_REQUEST: { target: "user", severity: "medium" },
  EMAIL_VERIFY: { target: "user", severity: "medium" },
  VERIFICATION_EMAIL_SEND: { target: "user", severity: "low" },
  PASSWORD_RESET_REQUEST: { target: "user", severity: "high" },
  PASSWORD_RESET: { target: "user", severity: "high" },
  PASSWORD_CHANGE: { target: "user", severity: "high" },
  PASSWORD_VERIFY: { target: "user", severity: "medium" },
  EMAIL_CHANGE: { target: "user", severity: "high", requiresChanges: true },
  SESSION_UPDATE: { target: "user", severity: "low" },
  SESSION_REVOKE: { target: "user", severity: "medium" },
  SESSIONS_REVOKE: { target: "user", severity: "medium" },
  OTHER_SESSIONS_REVOKE: { target: "user", severity: "medium" },
  ACCOUNT_LINK: { target: "user", severity: "high" },
  ACCOUNT_UNLINK: { target: "user", severity: "high" },
  TOKEN_REFRESH: { target: "user", severity: "low" },
  ACCESS_TOKEN_READ: { target: "user", severity: "medium" },
})

export const adminAudit = defineAuditCatalog("admin", {
  USER_CREATE: { target: "user", severity: "high" },
  USER_UPDATE: { target: "user", severity: "high", requiresChanges: true },
  USER_REMOVE: { target: "user", severity: "critical" },
  ROLE_SET: { target: "user", severity: "critical", requiresChanges: true },
  USER_BAN: { target: "user", severity: "high", requiresChanges: true },
  USER_UNBAN: { target: "user", severity: "high", requiresChanges: true },
  USER_IMPERSONATE: { target: "user", severity: "critical" },
  IMPERSONATION_STOP: { target: "user", severity: "medium" },
  USER_SESSION_REVOKE: { target: "user", severity: "high" },
  USER_SESSIONS_REVOKE: { target: "user", severity: "high" },
  USER_PASSWORD_SET: { target: "user", severity: "critical" },
  USER_LIST: { severity: "medium" },
  USER_GET: { target: "user", severity: "medium" },
  USER_SESSIONS_LIST: { target: "user", severity: "medium" },
})

export const userAudit = defineAuditCatalog("user", {
  PROFILE_UPDATE: { target: "user", severity: "medium", requiresChanges: true },
  SETTINGS_UPDATE: { target: "user", severity: "low", requiresChanges: true },
  DELETE: { target: "user", severity: "critical" },
  FOLLOW: { target: "user", severity: "low" },
  UNFOLLOW: { target: "user", severity: "low" },
})

export const mediaAudit = defineAuditCatalog("media", {
  CREATE: { target: "media", severity: "medium" },
  UPDATE: { target: "media", severity: "medium", requiresChanges: true },
  DELETE: { target: "media", severity: "high" },
  RESTORE: { target: "media", severity: "high" },
  FLAG: { target: "media", severity: "high", requiresChanges: true, requiresReason: true },
  REINDEX: { target: "media", severity: "low" },
})

export const coverAudit = defineAuditCatalog("media.cover", {
  CREATE: { target: "media", severity: "medium" },
  UPDATE: { target: "cover", severity: "medium", requiresChanges: true },
  DELETE: { target: "cover", severity: "high" },
  SET_MAIN: { target: "cover", severity: "medium" },
})

export const bannerAudit = defineAuditCatalog("media.banner", {
  CREATE: { target: "media", severity: "medium" },
  UPDATE: { target: "banner", severity: "medium", requiresChanges: true },
  DELETE: { target: "banner", severity: "high" },
})

export const mediaStaffAudit = defineAuditCatalog("media.staff", {
  LINK: { target: "media", severity: "medium" },
  UNLINK: { target: "media", severity: "medium" },
})

export const staffAudit = defineAuditCatalog("staff", {
  CREATE: { target: "staff", severity: "medium" },
  UPDATE: { target: "staff", severity: "medium", requiresChanges: true },
  DELETE: { target: "staff", severity: "high" },
})

export const chapterAudit = defineAuditCatalog("chapter", {
  CREATE: { target: "chapter", severity: "medium" },
  UPDATE: { target: "chapter", severity: "medium", requiresChanges: true },
  DELETE: { target: "chapter", severity: "high" },
})

export const chapterUploadAudit = defineAuditCatalog("chapter.upload", {
  START: { target: "chapter", severity: "medium" },
  FINALIZE: { target: "chapter", severity: "medium" },
  PROCESS: { target: "task", severity: "medium" },
  REAP: { target: "task", severity: "low" },
})

export const chapterGroupAudit = defineAuditCatalog("chapter.group", {
  LINK: { target: "chapter", severity: "medium" },
  UNLINK: { target: "chapter", severity: "medium" },
})

export const groupAudit = defineAuditCatalog("group", {
  CREATE: { target: "group", severity: "medium" },
  UPDATE: { target: "group", severity: "medium", requiresChanges: true },
  DELETE: { target: "group", severity: "high" },
})

export const groupMemberAudit = defineAuditCatalog("group.member", {
  ADD: { target: "group", severity: "medium" },
  REMOVE: { target: "group", severity: "high" },
  PROMOTE: { target: "group", severity: "high" },
  DEMOTE: { target: "group", severity: "high" },
  LEAVE: { target: "group", severity: "medium" },
})

export const groupOwnershipAudit = defineAuditCatalog("group.ownership", {
  REQUEST_CREATE: { target: "ownershipRequest", severity: "medium" },
  REQUEST_APPROVE: { target: "ownershipRequest", severity: "high" },
  REQUEST_REJECT: { target: "ownershipRequest", severity: "medium" },
  REQUEST_CANCEL: { target: "ownershipRequest", severity: "low" },
  TRANSFER: { target: "group", severity: "high" },
})

export const listAudit = defineAuditCatalog("list", {
  CREATE: { target: "list", severity: "low" },
  UPDATE: { target: "list", severity: "low", requiresChanges: true },
  DELETE: { target: "list", severity: "low" },
  ITEM_ADD: { target: "list", severity: "low" },
  ITEM_MOVE: { target: "list", severity: "low" },
  ITEM_REMOVE: { target: "list", severity: "low" },
})

export const libraryAudit = defineAuditCatalog("library", {
  ENTRY_SET: { target: "media", severity: "low" },
  ENTRY_REMOVE: { target: "media", severity: "low" },
})

export const historyAudit = defineAuditCatalog("history", {
  CHAPTER_OPEN: { target: "chapter", severity: "low" },
  PROGRESS_UPDATE: { target: "chapter", severity: "low" },
  ENTRY_DELETE: { target: "chapter", severity: "low" },
})

export const auditLogAudit = defineAuditCatalog("audit.log", {
  LIST: { severity: "medium" },
  GET: { target: "auditLog", severity: "medium" },
})

export const auditCatalogs = [
  authAudit,
  adminAudit,
  userAudit,
  mediaAudit,
  coverAudit,
  bannerAudit,
  mediaStaffAudit,
  staffAudit,
  chapterAudit,
  chapterUploadAudit,
  chapterGroupAudit,
  groupAudit,
  groupMemberAudit,
  groupOwnershipAudit,
  listAudit,
  libraryAudit,
  historyAudit,
  auditLogAudit,
]

declare module "evlog" {
  // oxlint-disable-next-line typescript/consistent-type-definitions
  interface RegisteredAuditCatalogs {
    auth: typeof authAudit
    admin: typeof adminAudit
    user: typeof userAudit
    media: typeof mediaAudit
    cover: typeof coverAudit
    banner: typeof bannerAudit
    mediaStaff: typeof mediaStaffAudit
    staff: typeof staffAudit
    chapter: typeof chapterAudit
    chapterUpload: typeof chapterUploadAudit
    chapterGroup: typeof chapterGroupAudit
    group: typeof groupAudit
    groupMember: typeof groupMemberAudit
    groupOwnership: typeof groupOwnershipAudit
    list: typeof listAudit
    library: typeof libraryAudit
    history: typeof historyAudit
    auditLog: typeof auditLogAudit
  }
}
