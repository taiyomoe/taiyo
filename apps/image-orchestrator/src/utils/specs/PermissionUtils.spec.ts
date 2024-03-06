import { Permission } from "~/types"
import { PermissionUtils } from "~/utils"

const baseOwnedPermissions = ["medias:create", "mediaChapters:update:any"]

describe("PermissionUtils", () => {
  describe("hasPermission", () => {
    it("should return true if the user has all the required permission (AND)", () => {
      const requiredPermissions: Permission[] = [["medias", "create"]]
      expect(PermissionUtils.hasPermission(baseOwnedPermissions, requiredPermissions)).toBe(true)
    })

    it("should return true if the user has one of the required permissions (OR)", () => {
      const requiredPermissions: Permission[] = [[["medias", "mediaTitles"], "create"]]
      expect(PermissionUtils.hasPermission(baseOwnedPermissions, requiredPermissions)).toBe(true)
    })

    it("should return true if there are no required permissions", () => {
      const requiredPermissions: Permission[] = []
      expect(PermissionUtils.hasPermission(baseOwnedPermissions, requiredPermissions)).toBe(true)
    })

    it("should return false if the user does not have the required permissions (AND)", () => {
      const requiredPermissions: Permission[] = [["medias", "delete"]]
      expect(PermissionUtils.hasPermission(baseOwnedPermissions, requiredPermissions)).toBe(false)
    })

    it("should return false if the user does not have any of the required permissions (AND)", () => {
      const requiredPermissions: Permission[] = [["medias", "delete"]]
      expect(PermissionUtils.hasPermission([], requiredPermissions)).toBe(false)
    })

    it("should return false if the user does not have all the required permissions (AND)", () => {
      const requiredPermissions: Permission[] = [
        [["medias", "mediaTitles"], "create"],
        ["medias", "delete"],
      ]
      expect(PermissionUtils.hasPermission(baseOwnedPermissions, requiredPermissions)).toBe(false)
    })
  })
})
