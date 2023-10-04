import type { InferSelectModel } from "drizzle-orm";

import type { roles } from "../schema/roles";

export const permissionsArray: Permissions = [
  "tags:create",
  "tags:update",
  "tags:delete",
  // -----
  "trackers:create",
  "trackers:update",
  "trackers:delete",
  // -----
  "medias:create",
  "medias:update",
  "medias:delete",
  // -----
  "mediaTags:create",
  "mediaTags:update",
  "mediaTags:delete",
  // -----
  "mediaTitles:create",
  "mediaTitles:update",
  "mediaTitles:delete",
  // -----
  "mediaBanners:create",
  "mediaBanners:update",
  "mediaBanners:delete",
  // -----
  "mediaCovers:create",
  "mediaCovers:update",
  "mediaCovers:delete",
  // -----
  "mediaChapters:create",
  "mediaChapters:update",
  "mediaChapters:delete",
  // -----
  "mediaChapterComments:create",
  "mediaChapterComments:update", // all users can update their own comments, but only admins can update other users' comments
  "mediaChapterComments:delete", // same
  // -----
  "scans:create",
  "scans:update",
  "scans:delete",
  // -----
  "scanMembers:create",
  "scanMembers:update",
  "scanMembers:delete",
];

export type Resources =
  | "tags"
  | "trackers"
  | "medias"
  | "mediaTags"
  | "mediaTitles"
  | "mediaBanners"
  | "mediaCovers"
  | "mediaChapters"
  | "mediaChapterComments"
  | "scans"
  | "scanMembers";
export type Actions = "create" | "update" | "delete"; // read is omitted

export type Permission = `${Resources}:${Actions}`;
export type Permissions = Permission[];

export type RefinedPermission = {
  resource: Resources;
  action: Actions;
};
export type RefinedPermissions = RefinedPermission[];

export type Role = InferSelectModel<typeof roles>;
