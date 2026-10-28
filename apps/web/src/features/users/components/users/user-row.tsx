import type { Permissions } from "@taiyomoe/permissions"
import * as stylex from "@stylexjs/stylex"
import { Badge } from "@taiyomoe/ui/components/ui/badge"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import type { ManagedUser } from "@/features/users/api/users"
import { ListRow } from "@/components/layout/dashboard-page"
import { TimeAgo } from "@/components/time/time-ago"
import { PersonAvatar } from "@/features/groups/components/group-avatar"
import { UserBanActions } from "@/features/users/components/users/user-ban-actions"
import { UserMoreMenu } from "@/features/users/components/users/user-more-menu"
import { UserRoleSelect } from "@/features/users/components/users/user-role-select"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  main: {
    gap: "0.25rem",
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    minWidth: 0,
  },
  titleLine: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
  },
  name: {
    fontWeight: 600,
    overflowWrap: "anywhere",
  },
  meta: {
    gap: "0.75rem",
    alignItems: "center",
    color: colors.mutedForeground,
    display: "flex",
    flexWrap: "wrap",
    fontSize: "0.875rem",
  },
  reason: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: "0.875rem",
    fontStyle: "italic",
    overflowWrap: "anywhere",
  },
  actions: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
    flexShrink: 0,
  },
})

export function UserRow({
  user,
  can,
  self,
  onBan,
}: {
  user: ManagedUser
  can: Permissions
  self: boolean
  onBan: (user: ManagedUser) => void
}) {
  return (
    <ListRow>
      <PersonAvatar person={user} />
      <div sx={styles.main}>
        <div sx={styles.titleLine}>
          <span sx={styles.name}>{user.displayUsername}</span>
          {user.banned ? (
            <Badge variant="error">
              {user.banExpires === null
                ? m.users_banned()
                : m.users_banned_until({ date: user.banExpires.slice(0, 10) })}
            </Badge>
          ) : null}
        </div>
        <div sx={styles.meta}>
          <span>@{user.username}</span>
          {user.email === null ? null : <span>{user.email}</span>}
          <span>
            {m.users_joined()} <TimeAgo date={user.createdAt} />
          </span>
        </div>
        {user.banned && user.banReason !== null ? (
          <p sx={styles.reason}>{m.users_ban_reason_shown({ reason: user.banReason })}</p>
        ) : null}
      </div>
      <div sx={styles.actions}>
        <UserRoleSelect
          editable={!self && can("user.setRole", { id: user.id, role: user.role })}
          user={user}
        />
        <UserBanActions
          canBan={can("user.ban", { id: user.id, role: user.role })}
          onBan={onBan}
          user={user}
        />
        <UserMoreMenu can={can} user={user} />
      </div>
    </ListRow>
  )
}
