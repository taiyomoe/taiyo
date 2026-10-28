import * as stylex from "@stylexjs/stylex"
import { Badge } from "@taiyomoe/ui/components/ui/badge"
import { colors, motion, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { Link } from "@tanstack/react-router"
import { GroupAvatar } from "@/features/groups/components/group-avatar"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
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
})

export function GroupCard({ group }: { group: { id: string; name: string; owned: boolean } }) {
  return (
    <Link params={{ groupId: group.id }} {...stylex.props(styles.card)} to="/groups/$groupId">
      <GroupAvatar id={group.id} name={group.name} />
      <span sx={styles.name}>{group.name}</span>
      {group.owned ? <Badge variant="success">{m.group_owned()}</Badge> : null}
    </Link>
  )
}
