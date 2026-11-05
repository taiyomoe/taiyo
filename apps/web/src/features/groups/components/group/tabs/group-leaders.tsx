import * as stylex from "@stylexjs/stylex"
import { Badge } from "@taiyomoe/ui/components/ui/badge"
import { colors, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { useQuery } from "@tanstack/react-query"
import { formatNumber } from "@/features/dashboard/lib/format"
import { groupMembersQueryOptions } from "@/features/groups/api/groups"
import { PersonAvatar } from "@/features/groups/components/group-avatar"
import { groupStyles } from "@/features/groups/components/group/group-styles"
import { formatMonthYear } from "@/features/groups/lib/group-format"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  section: {
    gap: "0.875rem",
    display: "flex",
    flexDirection: "column",
  },
  list: {
    margin: 0,
    padding: 0,
    gap: "0.75rem",
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
  },
  leader: {
    gap: "1rem",
    paddingBlock: "1rem",
    paddingInline: "1.25rem",
    alignItems: "center",
    backgroundImage: `linear-gradient(100deg, color-mix(in srgb, ${colors.primary} 7%, ${colors.card}), ${colors.card} 70%)`,
    display: "flex",
    flexWrap: "wrap",
  },
  avatar: {
    fontSize: "1.375rem",
    height: "3.5rem",
    width: "3.5rem",
  },
  text: {
    gap: "0.125rem",
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    minWidth: "10rem",
  },
  name: {
    color: colors.foreground,
    fontSize: "1.0625rem",
    fontWeight: 600,
    overflowWrap: "anywhere",
  },
  meta: {
    color: colors.mutedForeground,
    fontSize: "0.875rem",
  },
  badge: {
    borderRadius: radius.full,
  },
})

export function GroupLeaders({ groupId }: { groupId: string }) {
  const members = useQuery(groupMembersQueryOptions(groupId))
  const leaders = (members.data ?? []).filter((member) => member.role === "OWNER")

  if (leaders.length === 0) {
    return null
  }

  return (
    <section sx={styles.section}>
      <h3 sx={groupStyles.heading}>
        {leaders.length === 1 ? m.group_leader() : m.group_leaders()}
      </h3>
      <ul sx={styles.list}>
        {leaders.map((leader) => (
          <li key={leader.userId} sx={[groupStyles.card, styles.leader]}>
            <PersonAvatar
              person={{
                id: leader.userId,
                displayUsername: leader.displayUsername,
                image: leader.image,
              }}
              sx={styles.avatar}
            />
            <div sx={styles.text}>
              <span sx={styles.name}>{leader.displayUsername}</span>
              <span sx={styles.meta}>
                {m.group_leader_meta({
                  date: formatMonthYear(leader.createdAt),
                  count: formatNumber(leader.chapterCount),
                })}
              </span>
            </div>
            <Badge size="lg" sx={styles.badge} variant="error">
              {m.group_leader()}
            </Badge>
          </li>
        ))}
      </ul>
    </section>
  )
}
