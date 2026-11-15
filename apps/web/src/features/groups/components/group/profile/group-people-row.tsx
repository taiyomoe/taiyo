import type { ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import type { GroupMember } from "@/features/groups/api/groups"
import { UserLink } from "@/components/user-name/user-link"
import { PersonAvatar } from "@/features/groups/components/group-avatar"

const styles = stylex.create({
  row: {
    gap: "0.875rem",
    paddingBlock: "0.625rem",
    alignItems: "center",
    display: "flex",
    minWidth: 0,
  },
  avatar: {
    fontSize: "1rem",
    height: "2.5rem",
    width: "2.5rem",
  },
  text: {
    gap: "0.0625rem",
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    minWidth: 0,
  },
  name: {
    overflow: "hidden",
    fontWeight: 500,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  meta: {
    overflow: "hidden",
    color: colors.mutedForeground,
    fontSize: "0.8125rem",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
})

export function GroupPeopleRow({
  member,
  meta,
  trailing,
}: {
  member: GroupMember
  meta: string
  trailing?: ReactNode
}) {
  return (
    <div sx={styles.row}>
      <PersonAvatar
        person={{
          id: member.userId,
          displayUsername: member.displayUsername,
          image: member.image,
          avatarBorder: member.avatarBorder,
        }}
        sx={styles.avatar}
      />
      <span sx={styles.text}>
        <span sx={styles.name}>
          <UserLink user={member} />
        </span>
        <span sx={styles.meta}>{meta}</span>
      </span>
      {trailing}
    </div>
  )
}
