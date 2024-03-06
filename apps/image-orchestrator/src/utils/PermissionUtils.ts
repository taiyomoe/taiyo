import { Permission } from "~/types/permissions.types"

const hasPermission = (ownedPerms: string[], requiredPerms: Permission[]) => {
  const requiredResources = requiredPerms.map((p) => (typeof p[0] === "string" ? [p[0]] : p[0]))
  const requiredActions = requiredPerms.map((p) => (typeof p[1] === "string" ? [p[1]] : p[1]))

  const hasPermission = requiredResources.every((resources, i) => {
    const possession = requiredPerms[i][2] || "any"

    return resources.some((resource) => {
      const possiblePerms = [
        `${resource}:${requiredActions[i]}`,
        `${resource}:${requiredActions[i]}:own`,
      ].concat(possession === "any" ? `${resource}:${requiredActions[i]}:any` : [])

      return possiblePerms.some((p) => ownedPerms.includes(p))
    })
  })

  return hasPermission
}

export const PermissionUtils = {
  hasPermission,
}
