import type { GroupMembershipRole } from "@taiyomoe/permissions"
import * as stylex from "@stylexjs/stylex"
import { Crown } from "@taiyomoe/ui/components/icons"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { Pill } from "@/components/badges/pill"
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
    <Pill icon={Crown} iconSx={styles.crown} variant="secondary">
      {m.group_role_owner()}
    </Pill>
  ) : (
    <Pill>{m.group_role_member()}</Pill>
  )
}
