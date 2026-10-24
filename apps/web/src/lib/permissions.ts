import { createPermissions, toRole } from "@taiyomoe/permissions"
import { useQuery } from "@tanstack/react-query"
import type { Session } from "@/lib/queries/session"
import { type MyGroup, myGroupsQueryOptions } from "@/lib/queries/groups"

type User = Session["user"] | null | undefined

const toActor = (user: User, groups: readonly MyGroup[]) =>
  user === null || user === undefined
    ? null
    : {
        id: user.id,
        role: toRole(user.role),
        banned: user.banned === true,
        memberships: groups.map(({ group, role, permissions }) => ({
          groupId: group.id,
          role,
          permissions,
        })),
      }

export const getPermissions = (user: User) => createPermissions(toActor(user, []))

export function usePermissions(user: User) {
  const { data = [] } = useQuery({
    ...myGroupsQueryOptions,
    enabled: user !== null && user !== undefined,
  })

  return createPermissions(toActor(user, data))
}
