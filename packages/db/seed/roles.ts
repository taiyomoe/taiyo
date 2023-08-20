import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import type { Permissions } from "../schema/roles";
import { permissionsArray, roles } from "../schema/roles";

const execute = async (db: PostgresJsDatabase) => {
  const moderatorPermissions: Permissions = [
    "MEDIA_CHAPTER_COMMENT:UPDATE",
    "MEDIA_CHAPTER_COMMENT:DELETE",
  ];
  const uploaderPermissions: Permissions = moderatorPermissions.concat([
    "TAG:CREATE",
    "TAG:UPDATE",
    "TAG:DELETE",
    // -----
    "MEDIA:CREATE",
    "MEDIA:UPDATE",
    // -----
    "MEDIA_COVER:CREATE",
    "MEDIA_COVER:UPDATE",
    "MEDIA_CHAPTER:CREATE",
    // -----
    "MEDIA_BANNER:CREATE",
    "MEDIA_BANNER:DELETE",
    // -----
    "MEDIA_TAG:CREATE",
    "MEDIA_TAG:DELETE",
    // -----
    "MEDIA_TITLE:CREATE",
    "MEDIA_TITLE:UPDATE",
    // -----
    "MEDIA_CHAPTER:CREATE",
    "MEDIA_CHAPTER:UPDATE",
    "MEDIA_CHAPTER:DELETE",
    // -----
    "MEDIA_TITLE:CREATE",
    "MEDIA_TITLE:UPDATE",
    "MEDIA_TITLE:DELETE",
    // -----
    "SCAN:CREATE",
    "SCAN:UPDATE",
    "SCAN:DELETE",
  ]);

  await db.insert(roles).values([
    {
      id: "7bf9872c-1c80-4e78-be71-6fa0d3dc88d1",
      name: "USER",
      permissions: [],
    },
    {
      name: "MODERATOR",
      permissions: moderatorPermissions,
    },
    {
      name: "UPLOADER",
      permissions: uploaderPermissions,
    },
    {
      name: "ADMIN",
      permissions: Array.from(permissionsArray),
    },
  ]);
};

export default { execute };
