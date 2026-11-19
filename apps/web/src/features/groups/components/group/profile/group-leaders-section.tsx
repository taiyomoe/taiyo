import * as stylex from "@stylexjs/stylex"
import { useQuery } from "@tanstack/react-query"
import { formatNumber } from "@/features/dashboard/lib/format"
import { groupMembersQueryOptions } from "@/features/groups/api/groups"
import { GroupPeopleRow } from "@/features/groups/components/group/profile/group-people-row"
import { groupProfileStyles } from "@/features/groups/components/group/profile/group-profile-styles"
import { RoleBadge } from "@/features/groups/components/role-badge"
import { formatMonthYear } from "@/features/groups/lib/group-format"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  list: {
    margin: 0,
    padding: 0,
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
  },
})

export function GroupLeadersSection({ groupId }: { groupId: string }) {
  const members = useQuery(groupMembersQueryOptions(groupId))
  const leaders = (members.data ?? []).filter((member) => member.role === "OWNER")

  if (leaders.length === 0) {
    return null
  }

  return (
    <section sx={groupProfileStyles.section}>
      <h2 sx={groupProfileStyles.sectionTitle}>
        {leaders.length === 1 ? m.group_leader() : m.group_leaders()}
      </h2>
      <ul sx={styles.list}>
        {leaders.map((leader) => (
          <li key={leader.userId}>
            <GroupPeopleRow
              member={leader}
              meta={m.group_leader_meta({
                date: formatMonthYear(leader.createdAt),
                count: formatNumber(leader.chapterCount),
              })}
              trailing={<RoleBadge role="OWNER" />}
            />
          </li>
        ))}
      </ul>
    </section>
  )
}
