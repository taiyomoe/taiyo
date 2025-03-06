import type { Roles } from "@prisma/client"
import type {
  ForgedPermission,
  Permission,
  ResourcesWithPossession,
  ResourcesWithoutPossession,
} from "@taiyomoe/types"

const getPermissions = (): Permission[] => {
  const permissions: Permission[] = []

  for (const resource of getResourcesWithPosession()) {
    permissions.push(`${resource}:create`)
    permissions.push(`${resource}:update:any`)
    permissions.push(`${resource}:delete:any`)
    permissions.push(`${resource}:update:own`)
    permissions.push(`${resource}:delete:own`)
  }

  for (const resource of getResourcesWithoutPosession()) {
    permissions.push(`${resource}:create`)
    permissions.push(`${resource}:update`)
    permissions.push(`${resource}:delete`)
  }

  return permissions
}

const getUserPermissions = (): Permission[] => [
  "history:update:own",
  "library:update:own",
]

const getModeratorPermissions = (): Permission[] => []

const getUploaderInternPermissions = () =>
  getUserPermissions().concat([
    "medias:create",
    "medias:update:own",
    "medias:delete:own",
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
  ])

/**
 * This returns the same permissions as `getUploaderInternPermissions()` but with
 * the "own" posession replaced by "any".
 */
const getUploaderPermissions = () =>
  getUploaderInternPermissions().map((permission) =>
    permission.includes("own")
      ? (permission.replace("own", "any") as Permission)
      : permission,
  )

const getAdminPermissions = () =>
  getPermissions().filter((permission) => !permission.includes("own"))

const getRolePermissions = (role: Roles) => {
  switch (role) {
    case "USER":
      return getUserPermissions()
    case "MODERATOR":
      return getModeratorPermissions()
    case "UPLOADER_INTERN":
      return getUploaderInternPermissions()
    case "UPLOADER":
      return getUploaderPermissions()
    case "ADMIN":
      return getAdminPermissions()
  }
}

const getResourcesWithPosession = (): ResourcesWithPossession[] => [
  "trackers",
  "medias",
  "mediaTitles",
  "mediaBanners",
  "mediaCovers",
  "mediaChapters",
  "history",
  "library",
  "scans",
]

const getResourcesWithoutPosession = (): ResourcesWithoutPossession[] => [
  "usersFollow",
  "usersSettings",
]

const canAccessDashboard = (permissions: Permission[]) =>
  permissions.filter((p) => !getUserPermissions().includes(p)).length !== 0

const hasPermission = (
  ownedPerms: string[],
  requiredPerms: ForgedPermission[],
) => {
  const requiredResources = requiredPerms.map((p) =>
    typeof p[0] === "string" ? [p[0]] : p[0],
  )
  const requiredActions = requiredPerms.map((p) =>
    typeof p[1] === "string" ? [p[1]] : p[1],
  )

  const hasPermission = requiredResources.every((resources, i) => {
    const possession = requiredPerms[i]![2] || "any"

    return resources!.some((resource) => {
      const possiblePerms = [
        `${resource}:${requiredActions[i]}`,
        `${resource}:${requiredActions[i]}:own`,
      ].concat(
        possession === "any" ? `${resource}:${requiredActions[i]}:any` : [],
      )

      return possiblePerms.some((p) => ownedPerms.includes(p))
    })
  })

  return hasPermission
}

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
  canAccessDashboard,
  hasPermission,
}
