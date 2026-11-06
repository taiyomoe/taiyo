import * as stylex from "@stylexjs/stylex"
import { Badge } from "@taiyomoe/ui/components/ui/badge"
import { breakpoints, colors, motion, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { Link } from "@tanstack/react-router"
import type { UserProfile } from "@/features/users/api/profile"
import { GroupAvatar } from "@/features/groups/components/group-avatar"
import { profileStyles } from "@/features/users/components/profile/profile-styles"
import { m } from "@/paraglide/messages"

const LIST_INSET = "0.5rem"
const gutter = {
  default: `calc(1.25rem - ${LIST_INSET})`,
  [breakpoints.md]: `calc(1.5rem - ${LIST_INSET})`,
}
const styles = stylex.create({
  card: {
    padding: LIST_INSET,
    gap: "0.25rem",
    display: "flex",
    flexDirection: "column",
  },
  head: {
    gap: "0.5rem",
    paddingInline: gutter,
    alignItems: "baseline",
    display: "flex",
    paddingBottom: "0.5rem",
    paddingTop: gutter,
  },
  count: {
    color: colors.mutedForeground,
    fontSize: "0.875rem",
  },
  list: {
    margin: 0,
    padding: 0,
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
  },
  row: {
    borderRadius: `calc(${radius.xxl} - ${LIST_INSET} - 1px)`,
    gap: "0.875rem",
    paddingBlock: "0.625rem",
    paddingInline: gutter,
    textDecoration: "none",
    alignItems: "center",
    backgroundColor: {
      default: "transparent",
      ":hover": `color-mix(in srgb, ${colors.foreground} 5%, transparent)`,
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
    fontWeight: 500,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    minWidth: 0,
  },
})

export function ProfileGroups({ groups }: { groups: UserProfile["groups"] }) {
  if (groups.length === 0) {
    return null
  }

  return (
    <section sx={[profileStyles.card, styles.card]}>
      <div sx={styles.head}>
        <h2 sx={profileStyles.sectionTitle}>{m.profile_groups()}</h2>
        <span sx={styles.count}>{groups.length}</span>
      </div>
      <ul sx={styles.list}>
        {groups.map((group) => (
          <li key={group.id}>
            <Link
              params={{ groupId: group.id }}
              {...stylex.props(styles.row)}
              to="/groups/$groupId"
            >
              <GroupAvatar id={group.id} logoUrl={group.logoUrl} name={group.name} />
              <span sx={styles.name} title={group.name}>
                {group.name}
              </span>
              {group.role === "OWNER" ? (
                <Badge variant="success">{m.group_role_owner()}</Badge>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
