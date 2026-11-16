import type { Permissions } from "@taiyomoe/permissions"
import * as stylex from "@stylexjs/stylex"
import { ROLES } from "@taiyomoe/permissions"
import {
  Comment,
  ExternalLink,
  Eye,
  Key,
  Monitor,
  UserCheck,
  Users,
  UserRemove,
} from "@taiyomoe/ui/components/icons"
import { Badge } from "@taiyomoe/ui/components/ui/badge"
import { TableRow } from "@taiyomoe/ui/components/ui/table"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { Link } from "@tanstack/react-router"
import type { RowAction } from "@/features/catalog/components/shared/row-actions"
import type { ManagedUser } from "@/features/users/api/users"
import type { UserDialog } from "@/features/users/components/users/user-dialogs"
import { OptionLabel } from "@/components/fields/option-select"
import { TimeAgo } from "@/components/time/time-ago"
import { UserLink } from "@/components/user-name/user-link"
import { CatalogCell } from "@/features/catalog/components/shared/catalog-table"
import { mediaCellStyles, TitleCell } from "@/features/catalog/components/shared/media-cell"
import { RowActions } from "@/features/catalog/components/shared/row-actions"
import { catalogStyles } from "@/features/catalog/lib/catalog-styles"
import { PersonAvatar } from "@/features/groups/components/group-avatar"
import { useSetUserRole } from "@/features/users/api/users"
import { UserRoleSelect } from "@/features/users/components/users/user-role-select"
import { ROLE_OPTIONS } from "@/features/users/lib/role-labels"
import { m } from "@/paraglide/messages"
import { getLocale } from "@/paraglide/runtime"

const styles = stylex.create({
  role: {
    maxWidth: "100%",
    width: "13rem",
  },
  note: {
    color: colors.mutedForeground,
    fontSize: "0.8125rem",
    lineHeight: 1.35,
    whiteSpace: "normal",
  },
  reason: {
    overflow: "hidden",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: 2,
    color: colors.mutedForeground,
    display: "-webkit-box",
    fontSize: "0.8125rem",
    lineHeight: 1.35,
    overflowWrap: "anywhere",
  },
})

export function UserRow({
  user,
  can,
  self,
  unbanning,
  onDialog,
  onUnban,
}: {
  user: ManagedUser
  can: Permissions
  self: boolean
  unbanning: boolean
  onDialog: (kind: UserDialog["kind"]) => void
  onUnban: () => void
}) {
  const target = { id: user.id, role: user.role }
  const setRole = useSetUserRole()
  const roleEditable = !self && can("user.setRole", { id: user.id })
  const status = user.banned ? (
    <Badge variant="error">{m.users_banned()}</Badge>
  ) : (
    <Badge variant="success">{m.users_active()}</Badge>
  )
  const until =
    user.banned && user.banExpires !== null ? (
      <span sx={styles.note}>
        {m.users_banned_until({
          date: new Intl.DateTimeFormat(getLocale(), { dateStyle: "medium" }).format(
            new Date(user.banExpires),
          ),
        })}
      </span>
    ) : null
  const roleSelect = (
    <div sx={styles.role}>
      <UserRoleSelect editable={roleEditable} user={user} />
    </div>
  )
  const reason =
    user.banned && user.banReason !== null ? (
      <span sx={styles.reason} title={user.banReason}>
        {m.users_ban_reason_shown({ reason: user.banReason })}
      </span>
    ) : null
  const actions: RowAction[] = [
    {
      key: "profile",
      label: m.users_view_profile(),
      icon: ExternalLink,
      render: <Link params={{ username: user.username }} to="/users/$username" />,
    },
    ...(roleEditable
      ? [
          {
            key: "role",
            label: m.users_change_role(),
            icon: Users,
            disabled: setRole.isPending,
            choices: {
              value: user.role,
              items: ROLES.map((role) => ({
                value: role,
                label: ROLE_OPTIONS.label(role),
                icon: ROLE_OPTIONS.icon(role),
              })),
              onChange: (value: string) => {
                const role = ROLES.find((item) => item === value)

                if (role !== undefined && role !== user.role) {
                  setRole.mutate({ userId: user.id, role })
                }
              },
            },
          },
        ]
      : []),
    ...(can("comment.delete")
      ? [
          {
            key: "comments",
            label: m.users_view_comments(),
            icon: Comment,
            render: <Link search={{ author: user.id }} to="/dashboard/comments" />,
          },
        ]
      : []),
    ...(can("user.impersonate", target) && !user.banned
      ? [
          {
            key: "impersonate",
            label: m.user_admin_impersonate(),
            icon: Eye,
            onClick: () => {
              onDialog("impersonate")
            },
          },
        ]
      : []),
    ...(can("user.manageSessions", target)
      ? [
          {
            key: "sessions",
            label: m.user_admin_sessions(),
            icon: Monitor,
            onClick: () => {
              onDialog("sessions")
            },
          },
        ]
      : []),
    ...(can("user.setPassword", target)
      ? [
          {
            key: "password",
            label: m.user_admin_set_password(),
            icon: Key,
            onClick: () => {
              onDialog("password")
            },
          },
        ]
      : []),
    ...(can("user.ban", target) && user.banned
      ? [
          {
            key: "unban",
            label: m.users_unban(),
            icon: UserCheck,
            disabled: unbanning,
            onClick: onUnban,
          },
        ]
      : []),
    ...(can("user.ban", target) && !user.banned
      ? [
          {
            key: "ban",
            label: m.users_ban(),
            icon: UserRemove,
            destructive: true,
            onClick: () => {
              onDialog("ban")
            },
          },
        ]
      : []),
  ]

  return (
    <TableRow>
      <CatalogCell column="user">
        <TitleCell
          detail={user.email === null ? `@${user.username}` : `@${user.username} · ${user.email}`}
          narrow={{
            from: "3xl",
            content: (
              <>
                <Badge variant="outline">
                  <OptionLabel options={ROLE_OPTIONS} value={user.role} />
                </Badge>
                {user.banned ? status : null}
                {until}
                {reason}
              </>
            ),
          }}
          thumb={<PersonAvatar person={user} sx={mediaCellStyles.avatar} />}
          title={<UserLink sx={mediaCellStyles.title} user={user} />}
        />
      </CatalogCell>
      <CatalogCell column="role">{roleSelect}</CatalogCell>
      <CatalogCell column="status">
        <div {...stylex.props(catalogStyles.stack)}>
          {status}
          {until}
          {reason}
        </div>
      </CatalogCell>
      <CatalogCell column="joined" sx={catalogStyles.muted}>
        <TimeAgo date={user.createdAt} length="long" />
      </CatalogCell>
      <CatalogCell column="actions">
        <RowActions actions={actions} label={m.user_admin_more({ name: user.displayUsername })} />
      </CatalogCell>
    </TableRow>
  )
}
