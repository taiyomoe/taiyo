import type { GroupMembershipRole } from "@taiyomoe/permissions"
import * as stylex from "@stylexjs/stylex"
import { Crown } from "@taiyomoe/ui/components/icons"
import { Badge } from "@taiyomoe/ui/components/ui/badge"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  crown: {
    color: colors.warning,
    height: "0.875rem",
    width: "0.875rem",
  },
})

export function RoleBadge({ role }: { role: GroupMembershipRole }) {
  return role === "OWNER" ? (
    <Badge variant="secondary">
      <Crown {...stylex.props(styles.crown)} />
      {m.group_role_owner()}
    </Badge>
  ) : (
    <Badge variant="outline">{m.group_role_member()}</Badge>
  )
}
