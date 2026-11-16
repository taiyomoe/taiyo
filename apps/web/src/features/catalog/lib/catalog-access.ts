import type { Permissions } from "@taiyomoe/permissions"

/** Whoever may create, edit, delete or restore media opens the media table. */
export const canOpenMedias = (can: Permissions) =>
  can("media.create") || can("media.update") || can("media.delete") || can("media.restore")

/** Uploaders, moderators and admins see every chapter; group members see their groups' chapters. */
export const canOpenChapters = (can: Permissions) =>
  can("chapter.list") || can("chapter.listInGroups")

/** Covers and banners are edited, added and deleted under the same permission. */
export const canOpenImages = (can: Permissions) => can("media.update")
