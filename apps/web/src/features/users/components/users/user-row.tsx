import type { Permissions } from "@taiyomoe/permissions"
import * as stylex from "@stylexjs/stylex"
import {
  Coins,
  Comment,
  Edit,
  ExternalLink,
  Eye,
  Key,
  Monitor,
  Sparkles,
  UserCheck,
  UserRemove,
  Users,
} from "@taiyomoe/ui/components/icons"
import { TableRow } from "@taiyomoe/ui/components/ui/table"
import { toastManager } from "@taiyomoe/ui/components/ui/toast"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { Link } from "@tanstack/react-router"
import type { RowAction } from "@/features/catalog/components/shared/row-actions"
import type { Selection } from "@/features/catalog/hooks/use-selection"
import type { ManagedUser } from "@/features/users/api/users"
import type { UserDialog } from "@/features/users/components/users/user-dialogs"
import { Pill } from "@/components/badges/pill"
import { TimeAgo } from "@/components/time/time-ago"
import { UserLink } from "@/components/user-name/user-link"
import { CatalogCell, CatalogSelectCell } from "@/features/catalog/components/shared/catalog-table"
import { mediaCellStyles, TitleCell, Folded } from "@/features/catalog/components/shared/media-cell"
import { RowActions } from "@/features/catalog/components/shared/row-actions"
import { catalogStyles } from "@/features/catalog/lib/catalog-styles"
import { PersonAvatar } from "@/features/groups/components/group-avatar"
import { PointsAmount } from "@/features/shop/components/points-amount"
import { useSetUsersRole } from "@/features/users/api/users"
import { UserRoleBadge } from "@/features/users/components/users/user-role-badge"
import { ROLE_OPTIONS } from "@/features/users/lib/role-labels"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"
import { getLocale } from "@/paraglide/runtime"

const styles = stylex.create({
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
    whiteSpace: "normal",
  },
  points: {
    fontSize: "0.8125rem",
  },
})

export function UserRow({
  user,
  can,
  self,
  selection,
  unbanning,
  onDialog,
  onUnban,
}: {
  user: ManagedUser
  can: Permissions
  self: boolean
  selection: Selection | undefined
  unbanning: boolean
  onDialog: (kind: UserDialog["kind"]) => void
  onUnban: () => void
}) {
  const target = { id: user.id, role: user.role }
  const setRole = useSetUsersRole()
  const role = <UserRoleBadge role={user.role} />
  const status = user.banned ? (
    <Pill variant="error">{m.users_banned()}</Pill>
  ) : (
    <Pill variant="success">{m.users_active()}</Pill>
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
  const reason =
    user.banned && user.banReason !== null ? (
      <span sx={styles.reason} title={user.banReason}>
        {m.users_ban_reason_shown({ reason: user.banReason })}
      </span>
    ) : null
  const points = <PointsAmount points={user.points} size={13} sx={styles.points} />
  const open = (kind: UserDialog["kind"]) => () => {
    onDialog(kind)
  }
  const actions: RowAction[] = [
    {
      key: "profile",
      label: m.users_view_profile(),
      icon: ExternalLink,
      render: <Link params={{ username: user.username }} to="/users/$username" />,
    },
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
    ...(can("user.moderateProfile", target)
      ? [{ key: "editProfile", label: m.profile_edit(), icon: Edit, onClick: open("profile") }]
      : []),
    ...(!self && can("user.setRole", { id: user.id })
      ? [
          {
            key: "role",
            label: m.users_change_role(),
            icon: Users,
            disabled: setRole.isPending,
            choices: {
              value: user.role,
              items: ROLE_OPTIONS.values.map((value) => ({
                value,
                label: ROLE_OPTIONS.label(value),
                icon: ROLE_OPTIONS.icon(value),
              })),
              onChange: (value: string) => {
                const next = ROLE_OPTIONS.values.find((item) => item === value)

                if (next !== undefined && next !== user.role) {
                  setRole.mutate(
                    { userIds: [user.id], role: next },
                    {
                      onSuccess: () => {
                        toastManager.add({
                          title: m.users_role_changed({ name: user.displayUsername }),
                          type: "success",
                        })
                      },
                      onError: (error) => {
                        toastManager.add({ title: getErrorMessage(error), type: "error" })
                      },
                    },
                  )
                }
              },
            },
          },
        ]
      : []),
    ...(can("user.grant")
      ? [
          { key: "points", label: m.users_give_points(), icon: Coins, onClick: open("points") },
          {
            key: "cosmetic",
            label: m.users_give_cosmetic(),
            icon: Sparkles,
            onClick: open("cosmetic"),
          },
        ]
      : []),
    ...(can("user.impersonate", target) && !user.banned
      ? [
          {
            key: "impersonate",
            label: m.user_admin_impersonate(),
            icon: Eye,
            onClick: open("impersonate"),
          },
        ]
      : []),
    ...(can("user.manageSessions", target)
      ? [
          {
            key: "sessions",
            label: m.user_admin_sessions(),
            icon: Monitor,
            onClick: open("sessions"),
          },
        ]
      : []),
    ...(can("user.setPassword", target)
      ? [
          {
            key: "password",
            label: m.user_admin_set_password(),
            icon: Key,
            onClick: open("password"),
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
            onClick: open("ban"),
          },
        ]
      : []),
  ]

  return (
    <TableRow>
      {selection === undefined ? null : (
        <CatalogSelectCell id={user.id} label={user.displayUsername} selection={selection} />
      )}
      <CatalogCell column="user">
        <TitleCell
          detail={user.email === null ? `@${user.username}` : `@${user.username} · ${user.email}`}
          narrow={{
            from: "4xl",
            content: (
              <>
                <Folded until="3xl">{role}</Folded>
                {user.banned ? status : null}
                {points}
                {until}
                {reason}
                <span {...stylex.props(catalogStyles.muted)}>
                  <TimeAgo date={user.createdAt} length="long" />
                </span>
              </>
            ),
          }}
          thumb={<PersonAvatar person={user} sx={mediaCellStyles.avatar} />}
          title={<UserLink sx={mediaCellStyles.title} user={user} />}
        />
      </CatalogCell>
      <CatalogCell column="role">{role}</CatalogCell>
      <CatalogCell column="status">
        <div {...stylex.props(catalogStyles.stack)}>
          {status}
          {until}
          {reason}
        </div>
      </CatalogCell>
      <CatalogCell column="points">{points}</CatalogCell>
      <CatalogCell column="joined" sx={catalogStyles.muted}>
        <TimeAgo date={user.createdAt} length="long" />
      </CatalogCell>
      <CatalogCell column="actions">
        <RowActions actions={actions} label={m.user_admin_more({ name: user.displayUsername })} />
      </CatalogCell>
    </TableRow>
  )
}
