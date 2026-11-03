import * as stylex from "@stylexjs/stylex"
import { Badge } from "@taiyomoe/ui/components/ui/badge"
import { breakpoints, colors, motion, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { Link } from "@tanstack/react-router"
import type { UserProfile } from "@/features/users/api/profile"
import { GroupAvatar } from "@/features/groups/components/group-avatar"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  grid: {
    margin: 0,
    padding: 0,
    gap: "0.75rem",
    listStyle: "none",
    display: "grid",
    gridTemplateColumns: {
      default: "minmax(0, 1fr)",
      [breakpoints.md]: "repeat(2, minmax(0, 1fr))",
      [breakpoints.xl]: "repeat(3, minmax(0, 1fr))",
    },
  },
  card: {
    padding: "0.875rem",
    borderColor: colors.border,
    borderRadius: radius.xl,
    borderStyle: "solid",
    borderWidth: 1,
    gap: "0.875rem",
    textDecoration: "none",
    alignItems: "center",
    backgroundColor: {
      default: colors.card,
      ":hover": `color-mix(in srgb, ${colors.foreground} 4%, ${colors.card})`,
    },
    color: "inherit",
    display: "flex",
    transitionDuration: motion.enter,
    transitionProperty: "background-color",
    minWidth: 0,
  },
  name: {
    overflow: "hidden",
    flexGrow: 1,
    fontWeight: 600,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    minWidth: 0,
  },
  empty: {
    margin: 0,
    color: colors.mutedForeground,
  },
})

export function ProfileGroups({ groups }: { groups: UserProfile["groups"] }) {
  if (groups.length === 0) {
    return <p sx={styles.empty}>{m.profile_groups_empty()}</p>
  }

  return (
    <ul sx={styles.grid}>
      {groups.map((group) => (
        <li key={group.id}>
          <Link params={{ groupId: group.id }} {...stylex.props(styles.card)} to="/groups/$groupId">
            <GroupAvatar id={group.id} logoUrl={group.logoUrl} name={group.name} />
            <span sx={styles.name}>{group.name}</span>
            <Badge variant={group.role === "OWNER" ? "success" : "outline"}>
              {group.role === "OWNER" ? m.group_role_owner() : m.group_role_member()}
            </Badge>
          </Link>
        </li>
      ))}
    </ul>
  )
}
