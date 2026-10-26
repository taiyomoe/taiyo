import * as stylex from "@stylexjs/stylex"
import { useSuspenseQuery } from "@tanstack/react-query"
import { groupMembersQueryOptions } from "@/features/groups/api/groups"
import { GroupMemberChip } from "@/features/groups/components/group/group-member-chip"
import { groupStyles } from "@/features/groups/components/group/group-styles"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  members: {
    margin: 0,
    padding: 0,
    gap: "0.5rem",
    listStyle: "none",
    display: "flex",
    flexWrap: "wrap",
  },
})

type GroupMembersProps = {
  groupId: string
}

export function GroupMembers({ groupId }: GroupMembersProps) {
  const { data: members } = useSuspenseQuery(groupMembersQueryOptions(groupId))

  if (members.length === 0) {
    return <p sx={groupStyles.note}>{m.group_members_empty()}</p>
  }

  return (
    <ul sx={styles.members}>
      {members.map((member) => (
        <GroupMemberChip key={member.userId} member={member} />
      ))}
    </ul>
  )
}
