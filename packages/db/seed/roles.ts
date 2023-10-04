import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { roles } from "../schema/roles";
import { permissionsArray } from "../types";
import type { Permissions } from "../types";

const execute = async (db: PostgresJsDatabase) => {
  const userPermissions: Permissions = ["mediaChapterComments:create"];
  const moderatorPermissions: Permissions = userPermissions.concat([
    "mediaChapterComments:update",
    "mediaChapterComments:delete",
  ]);
  const uploaderPermissions: Permissions = moderatorPermissions.concat([
    "tags:create",
    "tags:update",
    "tags:delete",
    // -----
    "medias:create",
    "medias:update",
    // -----
    "mediaCovers:create",
    "mediaCovers:update",
    "mediaCovers:delete",
    // -----
    "mediaBanners:create",
    "mediaBanners:update",
    "mediaBanners:delete",
    // -----
    "mediaTags:create",
    "mediaTags:update",
    "mediaTags:delete",
    // -----
    "mediaTitles:create",
    "mediaTitles:update",
    "mediaTitles:update",
    // -----
    "mediaChapters:create",
    "mediaChapters:update",
    "mediaChapters:delete",
    // -----
    "scans:create",
    "scans:update",
    "scans:delete",
  ]);

  await db.insert(roles).values([
    {
      id: "7bf9872c-1c80-4e78-be71-6fa0d3dc88d1",
      name: "USER",
      permissions: userPermissions,
    },
    {
      id: "be5ee7fe-5597-4b34-b7c4-567c1cec503b",
      name: "MODERATOR",
      permissions: moderatorPermissions,
    },
    {
      id: "5edc0b23-2273-48e9-a0c4-0fd6f33705c6",
      name: "UPLOADER",
      permissions: uploaderPermissions,
    },
    {
      id: "13800840-0931-41e3-9270-0555e42fae36",
      name: "ADMIN",
      permissions: Array.from(permissionsArray),
    },
  ]);
};

export default { execute };
