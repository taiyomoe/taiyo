import type {
  Actions,
  Permission,
  Posession,
  RefinedPermission,
  Resources,
  ResourcesWithoutPossession,
  ResourcesWithPossession,
  Roles,
} from "@taiyo/db/types";

const getPermissions = (): Permission[] => {
  const permissions: Permission[] = [];

  for (const resource of getResourcesWithPosession()) {
    permissions.push(`${resource}:create`);
    permissions.push(`${resource}:update:any`);
    permissions.push(`${resource}:delete:any`);
    permissions.push(`${resource}:update:own`);
    permissions.push(`${resource}:delete:own`);
  }

  for (const resource of getResourcesWithoutPosession()) {
    permissions.push(`${resource}:create`);
    permissions.push(`${resource}:update`);
    permissions.push(`${resource}:delete`);
  }

  return permissions;
};

const getUserPermissions = (): Permission[] => [
  "mediaChapterComments:create",
  "mediaChapterComments:update:own",
  "mediaChapterComments:delete:own",
];

const getModeratorPermissions = (): Permission[] => [
  "mediaChapterComments:create",
  "mediaChapterComments:update:any",
  "mediaChapterComments:delete:any",
];

const getUploaderInternPermissions = () =>
  getUserPermissions().concat([
    "tags:create",
    "tags:update:own",
    "tags:delete:own",
    // -----
    "medias:create",
    "medias:update:own",
    "medias:delete:own",
    // -----
    "mediaTags:create",
    "mediaTags:update:own",
    "mediaTags:delete:own",
    // -----
    "mediaTitles:create",
    "mediaTitles:update:own",
    "mediaTitles:delete:own",
    // -----
    "mediaBanners:create",
    "mediaBanners:update:own",
    "mediaBanners:delete:own",
    // -----
    "mediaCovers:create",
    "mediaCovers:update:own",
    "mediaCovers:delete:own",
    // -----
    "mediaChapters:create",
    "mediaChapters:update:own",
    "mediaChapters:delete:own",
    // -----
    "scans:create",
    "scans:update:own",
    "scans:delete:own",
  ]);

/**
 * This returns the same permissions as `getUploaderInternPermissions()` but with
 * the "own" posession replaced by "any".
 */
const getUploaderPermissions = () =>
  getUploaderInternPermissions().map((permission) =>
    permission.includes("own")
      ? (permission.replace("own", "any") as Permission)
      : permission,
  );

const getAdminPermissions = () =>
  getPermissions().filter((permission) => !permission.includes("own"));

const getRolePermissions = (role: Roles) => {
  switch (role) {
    case "USER":
      return getUserPermissions();
    case "MODERATOR":
      return getModeratorPermissions();
    case "UPLOADER_INTERN":
      return getUploaderInternPermissions();
    case "UPLOADER":
      return getUploaderPermissions();
    case "ADMIN":
      return getAdminPermissions();
  }
};

const getResourcesWithPosession = (): ResourcesWithPossession[] => [
  "tags",
  "trackers",
  "medias",
  "mediaTags",
  "mediaTitles",
  "mediaBanners",
  "mediaCovers",
  "mediaChapters",
  "mediaChapterComments",
  "scans",
];

const getResourcesWithoutPosession = (): ResourcesWithoutPossession[] => [
  "scanMembers",
];

const refinePermission = (permission: Permission): RefinedPermission => {
  const [resource, action, posession] = permission.split(":") as [
    Resources,
    Actions,
    Posession | undefined,
  ];

  if (posession) {
    return {
      resource,
      action,
      posession,
    };
  }

  return {
    resource,
    action,
  };
};

const refinePermissions = (permissions: Permission[]): RefinedPermission[] =>
  permissions.map(refinePermission);

export const PermissionUtils = {
  getPermissions,
  getUserPermissions,
  getModeratorPermissions,
  getUploaderInternPermissions,
  getUploaderPermissions,
  getAdminPermissions,
  getRolePermissions,
  getResourcesWithPosession,
  getResourcesWithoutPosession,
  refinePermission,
  refinePermissions,
};
