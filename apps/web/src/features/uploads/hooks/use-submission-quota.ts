import type { Permissions } from "@taiyomoe/permissions"
import { config } from "@taiyomoe/config"
import { useQuery } from "@tanstack/react-query"
import type { GroupOption } from "@/features/groups/components/group-picker"
import { pendingSubmissionsCountQueryOptions } from "@/features/uploads/api/submissions"

export function useSubmissionQuota(can: Permissions, groups: GroupOption[], rowCount: number) {
  const publishes =
    can("chapter.publish") || groups.some((group) => can("group.uploadChapters", { id: group.id }))
  const pending = useQuery({ ...pendingSubmissionsCountQueryOptions, enabled: !publishes })
  const slotsLeft = Math.max(config.input.maxPendingChapters - (pending.data ?? 0), 0)
  const overCap = !publishes && pending.data !== undefined && rowCount > slotsLeft

  return { publishes, pendingCount: pending.data, slotsLeft, overCap }
}
