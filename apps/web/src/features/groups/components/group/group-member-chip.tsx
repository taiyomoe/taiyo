import * as stylex from "@stylexjs/stylex"
import { Crown } from "@taiyomoe/ui/components/icons"
import { colors, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import type { GroupMember } from "@/features/groups/api/groups"
import { PersonAvatar } from "@/features/groups/components/group-avatar"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  member: {
    borderColor: colors.border,
    borderRadius: radius.full,
    borderStyle: "solid",
    borderWidth: 1,
    gap: "0.625rem",
    paddingBlock: "0.3125rem",
    alignItems: "center",
    backgroundColor: colors.card,
    display: "inline-flex",
    paddingInlineEnd: "1rem",
    paddingInlineStart: "0.3125rem",
  },
  memberName: {
    fontSize: "0.9375rem",
    fontWeight: 500,
  },
  crown: {
    color: colors.warning,
    height: "1rem",
    width: "1rem",
  },
})

type GroupMemberChipProps = {
  member: GroupMember
}

export function GroupMemberChip({ member }: GroupMemberChipProps) {
  return (
    <li sx={styles.member}>
      <PersonAvatar
        person={{
          id: member.userId,
          displayUsername: member.displayUsername,
          image: member.image,
        }}
      />
      <span sx={styles.memberName}>{member.displayUsername}</span>
      {member.role === "OWNER" ? (
        <Crown aria-label={m.group_role_owner()} {...stylex.props(styles.crown)} />
      ) : null}
    </li>
  )
}
