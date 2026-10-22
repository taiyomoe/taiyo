import { describe, expect, it } from "vitest"
import {
  type Actor,
  type ActorMembership,
  buildRules,
  createPermissions,
  GROUP_PERMISSIONS,
  type GroupPermission,
  type MemberTarget,
  ROLES,
  type Role,
  type StaticPermissionPath,
  toRole,
} from ".."

const GROUP_A = "00000000-0000-4000-8000-00000000000a"
const GROUP_B = "00000000-0000-4000-8000-00000000000b"
const ACTOR_ID = "00000000-0000-4000-8000-000000000001"
const OTHER_ID = "00000000-0000-4000-8000-000000000002"
const actor = (role: Role, memberships: ActorMembership[] = [], banned = false) =>
  ({ id: ACTOR_ID, role, banned, memberships }) satisfies Actor
const member = (groupId: string, permissions: GroupPermission[] = []) =>
  ({ groupId, role: "MEMBER", permissions }) satisfies ActorMembership
const owner = (groupId: string) =>
  ({ groupId, role: "OWNER", permissions: [] }) satisfies ActorMembership
const target = (overrides: Partial<MemberTarget> = {}) =>
  ({
    groupId: GROUP_A,
    userId: OTHER_ID,
    role: "MEMBER",
    permissions: [],
    ...overrides,
  }) satisfies MemberTarget
const chapter = (groupIds: string[] = [], uploaderId = OTHER_ID) => ({ uploaderId, groupIds })
const STATIC_MATRIX: Record<StaticPermissionPath, readonly Role[]> = {
  "dashboard.open": ROLES,
  "dashboard.viewStats": ["MODERATOR", "ADMIN"],
  "media.create": ["UPLOADER_INTERN", "UPLOADER", "ADMIN"],
  "media.update": ["UPLOADER_INTERN", "UPLOADER", "MODERATOR", "ADMIN"],
  "media.delete": ["UPLOADER", "ADMIN"],
  "media.restore": ["ADMIN"],
  "media.flag": ["MODERATOR", "ADMIN"],
  "media.reindex": ["ADMIN"],
  "staff.create": ["UPLOADER_INTERN", "UPLOADER", "ADMIN"],
  "staff.update": ["UPLOADER_INTERN", "UPLOADER", "MODERATOR", "ADMIN"],
  "staff.delete": ["UPLOADER", "ADMIN"],
  "chapter.publish": ["UPLOADER", "ADMIN"],
  "chapter.flag": ["UPLOADER", "MODERATOR", "ADMIN"],
  "group.create": ["UPLOADER", "ADMIN"],
  "group.delete": ["ADMIN"],
  "ownershipRequest.create": ROLES,
  "ownershipRequest.review": ["ADMIN"],
  "comment.delete": ["MODERATOR", "ADMIN"],
  "user.list": ["MODERATOR", "ADMIN"],
}
const leaves = (node: object, prefix = ""): Array<[string, unknown]> =>
  Object.entries(node).flatMap(([key, value]: [string, unknown]): Array<[string, unknown]> =>
    typeof value === "object" && value !== null
      ? leaves(value, `${prefix}${key}.`)
      : [[`${prefix}${key}`, value]],
  )
const STATIC_PATHS = Object.keys(STATIC_MATRIX).filter((path): path is StaticPermissionPath =>
  Object.hasOwn(STATIC_MATRIX, path),
)

describe("role matrix", () => {
  it("covers every permission that takes no data", () => {
    const staticPaths = leaves(buildRules(actor("ADMIN")))
      .filter(([, rule]) => typeof rule === "boolean")
      .map(([path]) => path)

    expect([...staticPaths].sort()).toEqual([...STATIC_PATHS].sort())
  })

  describe.each(ROLES)("%s", (role) => {
    const can = createPermissions(actor(role))

    for (const path of STATIC_PATHS) {
      const expected = STATIC_MATRIX[path].includes(role)

      it(`${expected ? "can" : "cannot"} ${path}`, () => {
        expect(can(path)).toBe(expected)
      })
    }
  })

  it("lets admins do everything that takes no data", () => {
    const can = createPermissions(actor("ADMIN"))

    expect(STATIC_PATHS.every((path) => can(path))).toBe(true)
  })
})

describe("signed-out and banned users", () => {
  const everything = (can: ReturnType<typeof createPermissions>) => [
    ...STATIC_PATHS.map((path) => can(path)),
    can("chapter.update", chapter([GROUP_A])),
    can("chapter.delete", chapter([GROUP_A])),
    can("chapter.credit", { chapter: chapter([GROUP_A]), groupId: GROUP_B }),
    can("chapter.uncredit", { chapter: chapter([GROUP_A]), groupId: GROUP_A }),
    can("group.update", { id: GROUP_A }),
    can("group.uploadChapters", { id: GROUP_A }),
    can("group.manageMembers", { id: GROUP_A }),
    can("group.transferOwnership", { id: GROUP_A }),
    can("group.updateMember", { member: target(), permissions: ["EDIT_CHAPTERS"] }),
    can("group.removeMember", target()),
    can("group.promoteMember", target()),
    can("group.demoteMember", target({ role: "OWNER", userId: ACTOR_ID })),
    can("user.ban", { id: OTHER_ID, role: "USER" }),
    can("user.setRole", { id: OTHER_ID, role: "USER" }),
  ]

  it("denies everything when signed out", () => {
    expect(everything(createPermissions(null)).some(Boolean)).toBe(false)
  })

  it("denies everything to a banned admin who owns the group", () => {
    const can = createPermissions(actor("ADMIN", [owner(GROUP_A), owner(GROUP_B)], true))

    expect(everything(can).some(Boolean)).toBe(false)
  })

  it("denies every permission tree query when signed out", () => {
    const can = createPermissions(null)

    expect(can("~any")).toBe(false)
  })
})

describe("toRole", () => {
  it("keeps known roles", () => {
    for (const role of ROLES) {
      expect(toRole(role)).toBe(role)
    }
  })

  it("falls back to USER for anything else", () => {
    for (const value of ["admin", "ROOT", "", null, undefined, 1, ["ADMIN"], { role: "ADMIN" }]) {
      expect(toRole(value)).toBe("USER")
    }
  })
})

describe("chapters", () => {
  it("lets uploaders, moderators and admins edit and delete any chapter", () => {
    for (const role of ["UPLOADER", "MODERATOR", "ADMIN"] as const) {
      const can = createPermissions(actor(role))

      expect(can("chapter.update", chapter())).toBe(true)
      expect(can("chapter.delete", chapter())).toBe(true)
      expect(can("chapter.uncredit", { chapter: chapter([GROUP_A]), groupId: GROUP_A })).toBe(true)
    }
  })

  it("does not let users or interns edit chapters outside their groups", () => {
    for (const role of ["USER", "UPLOADER_INTERN"] as const) {
      const can = createPermissions(actor(role))

      expect(can("chapter.update", chapter([GROUP_A]))).toBe(false)
      expect(can("chapter.delete", chapter([GROUP_A]))).toBe(false)
    }
  })

  it("does not give uploading a chapter rights over it once it is published", () => {
    const can = createPermissions(actor("USER"))

    expect(can("chapter.update", chapter([], ACTOR_ID))).toBe(false)
    expect(can("chapter.delete", chapter([], ACTOR_ID))).toBe(false)
  })

  it("lets a group owner edit and delete every chapter credited to the group", () => {
    const can = createPermissions(actor("USER", [owner(GROUP_A)]))

    expect(can("chapter.update", chapter([GROUP_A]))).toBe(true)
    expect(can("chapter.delete", chapter([GROUP_A]))).toBe(true)
    expect(can("chapter.update", chapter([GROUP_B]))).toBe(false)
    expect(can("chapter.delete", chapter([GROUP_B]))).toBe(false)
  })

  it("gives members exactly the chapter permissions they were granted", () => {
    const editor = createPermissions(actor("USER", [member(GROUP_A, ["EDIT_CHAPTERS"])]))
    const deleter = createPermissions(actor("USER", [member(GROUP_A, ["DELETE_CHAPTERS"])]))
    const uploader = createPermissions(actor("USER", [member(GROUP_A, ["UPLOAD_CHAPTERS"])]))
    const bare = createPermissions(actor("USER", [member(GROUP_A)]))

    expect(editor("chapter.update", chapter([GROUP_A]))).toBe(true)
    expect(editor("chapter.delete", chapter([GROUP_A]))).toBe(false)
    expect(deleter("chapter.update", chapter([GROUP_A]))).toBe(false)
    expect(deleter("chapter.delete", chapter([GROUP_A]))).toBe(true)
    expect(uploader("chapter.update", chapter([GROUP_A]))).toBe(false)
    expect(uploader("group.uploadChapters", { id: GROUP_A })).toBe(true)
    expect(bare("chapter.update", chapter([GROUP_A]))).toBe(false)
    expect(bare("chapter.delete", chapter([GROUP_A]))).toBe(false)
    expect(bare("group.uploadChapters", { id: GROUP_A })).toBe(false)
  })

  it("is enough to hold the permission in one of the credited groups", () => {
    const can = createPermissions(actor("USER", [member(GROUP_A, ["DELETE_CHAPTERS"])]))

    expect(can("chapter.delete", chapter([GROUP_B, GROUP_A]))).toBe(true)
  })

  it("lets editors credit any group but only remove credits of groups they edit for", () => {
    const can = createPermissions(actor("USER", [member(GROUP_A, ["EDIT_CHAPTERS"])]))
    const shared = chapter([GROUP_A, GROUP_B])

    expect(can("chapter.credit", { chapter: chapter([GROUP_A]), groupId: GROUP_B })).toBe(true)
    expect(can("chapter.credit", { chapter: chapter([GROUP_B]), groupId: GROUP_A })).toBe(false)
    expect(can("chapter.uncredit", { chapter: shared, groupId: GROUP_A })).toBe(true)
    expect(can("chapter.uncredit", { chapter: shared, groupId: GROUP_B })).toBe(false)
    expect(can("chapter.uncredit", { chapter: chapter([GROUP_B]), groupId: GROUP_A })).toBe(false)
  })

  it("only uses the group the membership belongs to", () => {
    const can = createPermissions(actor("USER", [member(GROUP_A, [...GROUP_PERMISSIONS])]))

    expect(can("chapter.update", chapter([GROUP_B]))).toBe(false)
    expect(can("group.uploadChapters", { id: GROUP_B })).toBe(false)
    expect(can("group.update", { id: GROUP_B })).toBe(false)
  })
})

describe("groups", () => {
  it("lets uploaders, moderators, admins, owners and EDIT_GROUP members edit the group", () => {
    for (const role of ["UPLOADER", "MODERATOR", "ADMIN"] as const) {
      expect(createPermissions(actor(role))("group.update", { id: GROUP_A })).toBe(true)
    }

    expect(
      createPermissions(actor("USER", [owner(GROUP_A)]))("group.update", { id: GROUP_A }),
    ).toBe(true)
    expect(
      createPermissions(actor("USER", [member(GROUP_A, ["EDIT_GROUP"])]))("group.update", {
        id: GROUP_A,
      }),
    ).toBe(true)
    expect(
      createPermissions(actor("USER", [member(GROUP_A)]))("group.update", { id: GROUP_A }),
    ).toBe(false)
    expect(createPermissions(actor("UPLOADER_INTERN"))("group.update", { id: GROUP_A })).toBe(false)
  })

  it("never lets owners or members delete their group", () => {
    const can = createPermissions(actor("USER", [owner(GROUP_A)]))

    expect(can("group.delete")).toBe(false)
  })

  it("lets owners upload, manage members and transfer ownership", () => {
    const can = createPermissions(actor("USER", [owner(GROUP_A)]))

    expect(can("group.uploadChapters", { id: GROUP_A })).toBe(true)
    expect(can("group.manageMembers", { id: GROUP_A })).toBe(true)
    expect(can("group.transferOwnership", { id: GROUP_A })).toBe(true)
    expect(can("group.transferOwnership", { id: GROUP_B })).toBe(false)
  })

  it("does not let members transfer ownership, even with every permission", () => {
    const can = createPermissions(actor("USER", [member(GROUP_A, [...GROUP_PERMISSIONS])]))

    expect(can("group.transferOwnership", { id: GROUP_A })).toBe(false)
    expect(can("group.promoteMember", target())).toBe(false)
  })

  it("does not let moderators or uploaders manage members", () => {
    for (const role of ["UPLOADER", "MODERATOR", "UPLOADER_INTERN"] as const) {
      const can = createPermissions(actor(role))

      expect(can("group.manageMembers", { id: GROUP_A })).toBe(false)
      expect(can("group.removeMember", target())).toBe(false)
      expect(can("group.updateMember", { member: target(), permissions: [] })).toBe(false)
      expect(can("group.promoteMember", target())).toBe(false)
    }
  })

  describe("owners", () => {
    const can = createPermissions(actor("USER", [owner(GROUP_A)]))

    it("can grant and revoke any permission on members", () => {
      expect(
        can("group.updateMember", { member: target(), permissions: [...GROUP_PERMISSIONS] }),
      ).toBe(true)
      expect(
        can("group.updateMember", {
          member: target({ permissions: [...GROUP_PERMISSIONS] }),
          permissions: [],
        }),
      ).toBe(true)
    })

    it("can remove and promote members", () => {
      expect(can("group.removeMember", target({ permissions: ["MANAGE_MEMBERS"] }))).toBe(true)
      expect(can("group.promoteMember", target())).toBe(true)
    })

    it("cannot edit, remove or demote another owner", () => {
      const coOwner = target({ role: "OWNER" })

      expect(can("group.updateMember", { member: coOwner, permissions: [] })).toBe(false)
      expect(can("group.removeMember", coOwner)).toBe(false)
      expect(can("group.demoteMember", coOwner)).toBe(false)
    })

    it("can step down", () => {
      expect(can("group.demoteMember", target({ role: "OWNER", userId: ACTOR_ID }))).toBe(true)
    })

    it("has no say over other groups", () => {
      const elsewhere = target({ groupId: GROUP_B })

      expect(can("group.updateMember", { member: elsewhere, permissions: [] })).toBe(false)
      expect(can("group.removeMember", elsewhere)).toBe(false)
      expect(can("group.promoteMember", elsewhere)).toBe(false)
    })
  })

  describe("members with MANAGE_MEMBERS", () => {
    const can = createPermissions(
      actor("USER", [member(GROUP_A, ["MANAGE_MEMBERS", "UPLOAD_CHAPTERS", "EDIT_CHAPTERS"])]),
    )

    it("can grant and revoke permissions they hold", () => {
      expect(
        can("group.updateMember", {
          member: target(),
          permissions: ["UPLOAD_CHAPTERS", "EDIT_CHAPTERS"],
        }),
      ).toBe(true)
      expect(
        can("group.updateMember", {
          member: target({ permissions: ["EDIT_CHAPTERS"] }),
          permissions: [],
        }),
      ).toBe(true)
    })

    it("cannot grant permissions they do not hold", () => {
      expect(
        can("group.updateMember", { member: target(), permissions: ["DELETE_CHAPTERS"] }),
      ).toBe(false)
      expect(can("group.updateMember", { member: target(), permissions: ["EDIT_GROUP"] })).toBe(
        false,
      )
    })

    it("cannot hand out MANAGE_MEMBERS", () => {
      expect(can("group.updateMember", { member: target(), permissions: ["MANAGE_MEMBERS"] })).toBe(
        false,
      )
    })

    it("cannot touch members who hold permissions they lack", () => {
      const stronger = target({ permissions: ["DELETE_CHAPTERS"] })

      expect(
        can("group.updateMember", {
          member: stronger,
          permissions: ["DELETE_CHAPTERS", "EDIT_CHAPTERS"],
        }),
      ).toBe(false)
      expect(can("group.removeMember", stronger)).toBe(false)
    })

    it("cannot touch other managers", () => {
      const manager = target({ permissions: ["MANAGE_MEMBERS"] })

      expect(
        can("group.updateMember", {
          member: manager,
          permissions: ["MANAGE_MEMBERS", "EDIT_CHAPTERS"],
        }),
      ).toBe(false)
      expect(can("group.removeMember", manager)).toBe(false)
    })

    it("cannot edit their own permissions", () => {
      const self = target({
        userId: ACTOR_ID,
        permissions: ["MANAGE_MEMBERS", "UPLOAD_CHAPTERS", "EDIT_CHAPTERS"],
      })

      expect(can("group.updateMember", { member: self, permissions: [...GROUP_PERMISSIONS] })).toBe(
        false,
      )
      expect(can("group.removeMember", self)).toBe(false)
    })

    it("can remove members whose permissions they all hold", () => {
      expect(can("group.removeMember", target({ permissions: ["EDIT_CHAPTERS"] }))).toBe(true)
      expect(can("group.removeMember", target())).toBe(true)
    })

    it("cannot touch owners", () => {
      const groupOwner = target({ role: "OWNER" })

      expect(can("group.updateMember", { member: groupOwner, permissions: [] })).toBe(false)
      expect(can("group.removeMember", groupOwner)).toBe(false)
      expect(can("group.demoteMember", groupOwner)).toBe(false)
    })
  })

  it("lets admins manage any membership", () => {
    const can = createPermissions(actor("ADMIN"))
    const groupOwner = target({ role: "OWNER" })

    expect(can("group.manageMembers", { id: GROUP_A })).toBe(true)
    expect(can("group.updateMember", { member: groupOwner, permissions: ["EDIT_GROUP"] })).toBe(
      true,
    )
    expect(can("group.removeMember", groupOwner)).toBe(true)
    expect(can("group.promoteMember", target())).toBe(true)
    expect(can("group.demoteMember", groupOwner)).toBe(true)
  })

  it("only promotes members and only demotes owners", () => {
    const can = createPermissions(actor("ADMIN"))

    expect(can("group.promoteMember", target({ role: "OWNER" }))).toBe(false)
    expect(can("group.demoteMember", target())).toBe(false)
  })
})

describe("users", () => {
  it("lets moderators ban regular users only", () => {
    const can = createPermissions(actor("MODERATOR"))

    expect(can("user.ban", { id: OTHER_ID, role: "USER" })).toBe(true)

    for (const role of ["UPLOADER_INTERN", "UPLOADER", "MODERATOR", "ADMIN"] as const) {
      expect(can("user.ban", { id: OTHER_ID, role })).toBe(false)
    }
  })

  it("lets admins ban anyone but themselves", () => {
    const can = createPermissions(actor("ADMIN"))

    for (const role of ROLES) {
      expect(can("user.ban", { id: OTHER_ID, role })).toBe(true)
    }

    expect(can("user.ban", { id: ACTOR_ID, role: "ADMIN" })).toBe(false)
  })

  it("only lets admins change roles, never their own", () => {
    expect(createPermissions(actor("ADMIN"))("user.setRole", { id: OTHER_ID, role: "USER" })).toBe(
      true,
    )
    expect(createPermissions(actor("ADMIN"))("user.setRole", { id: ACTOR_ID, role: "ADMIN" })).toBe(
      false,
    )

    for (const role of ["USER", "UPLOADER_INTERN", "UPLOADER", "MODERATOR"] as const) {
      expect(createPermissions(actor(role))("user.setRole", { id: OTHER_ID, role: "USER" })).toBe(
        false,
      )
    }
  })

  it("does not let users ban anyone", () => {
    for (const role of ["USER", "UPLOADER_INTERN", "UPLOADER"] as const) {
      expect(createPermissions(actor(role))("user.ban", { id: OTHER_ID, role: "USER" })).toBe(false)
    }
  })
})
