import * as stylex from "@stylexjs/stylex"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { useSuspenseQuery } from "@tanstack/react-query"
import { range } from "remeda"
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
  chip: {
    borderRadius: radius.full,
    height: "3rem",
  },
})
const SKELETON_WIDTHS = ["11rem", "9rem", "10rem"]

export function GroupMembers({ groupId }: { groupId: string }) {
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

export function GroupMembersSkeleton() {
  return (
    <div aria-hidden sx={styles.members}>
      {range(0, SKELETON_WIDTHS.length).map((index) => (
        <Skeleton key={index} style={{ width: SKELETON_WIDTHS[index] }} sx={styles.chip} />
      ))}
    </div>
  )
}
