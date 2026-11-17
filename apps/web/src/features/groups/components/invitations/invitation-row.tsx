import * as stylex from "@stylexjs/stylex"
import { Check, Close, ExternalLink, Key, User } from "@taiyomoe/ui/components/icons"
import { TableRow } from "@taiyomoe/ui/components/ui/table"
import { Link } from "@tanstack/react-router"
import type { RowAction } from "@/features/catalog/components/shared/row-actions"
import type { Selection } from "@/features/catalog/hooks/use-selection"
import type { MyGroupInvitation } from "@/features/groups/api/groups"
import { TimeAgo } from "@/components/time/time-ago"
import { CatalogCell, CatalogSelectCell } from "@/features/catalog/components/shared/catalog-table"
import { mediaCellStyles, TitleCell, Folded } from "@/features/catalog/components/shared/media-cell"
import { RowActions } from "@/features/catalog/components/shared/row-actions"
import { catalogStyles } from "@/features/catalog/lib/catalog-styles"
import { Uploader } from "@/features/chapters/components/uploader"
import { GroupAvatar } from "@/features/groups/components/group-avatar"
import { PermissionPills } from "@/features/groups/components/permission-pills"
import { m } from "@/paraglide/messages"

export function InvitationRow({
  invitation,
  selection,
  answering,
  onAccept,
  onDecline,
  onDetails,
}: {
  invitation: MyGroupInvitation
  selection: Selection
  answering: boolean
  onAccept: () => void
  onDecline: () => void
  onDetails: () => void
}) {
  const inviter = (
    <Uploader
      title={m.invitation_invited_by({ name: invitation.inviter.displayUsername })}
      uploader={invitation.inviter}
    />
  )
  const permissions = <PermissionPills permissions={invitation.permissions} />
  const actions: RowAction[] = [
    {
      key: "accept",
      label: m.invitation_accept(),
      icon: Check,
      disabled: answering,
      onClick: onAccept,
    },
    { key: "details", label: m.invitation_see_permissions(), icon: Key, onClick: onDetails },
    {
      key: "group",
      label: m.all_groups_view_page(),
      icon: ExternalLink,
      render: <Link params={{ groupId: invitation.group.id }} to="/groups/$groupId" />,
    },
    {
      key: "inviter",
      label: m.invitation_view_inviter(),
      icon: User,
      render: <Link params={{ username: invitation.inviter.username }} to="/users/$username" />,
    },
    {
      key: "decline",
      label: m.invitation_decline(),
      icon: Close,
      destructive: true,
      disabled: answering,
      onClick: onDecline,
    },
  ]

  return (
    <TableRow>
      <CatalogSelectCell id={invitation.id} label={invitation.group.name} selection={selection} />
      <CatalogCell column="group">
        <TitleCell
          detail={
            <>
              {m.invitation_expires()} <TimeAgo date={invitation.expiresAt} future length="long" />
            </>
          }
          narrow={{
            from: "4xl",
            content: (
              <>
                <Folded until="3xl">
                  {inviter}
                  <PermissionPills compact permissions={invitation.permissions} />
                </Folded>
                <span {...stylex.props(catalogStyles.muted)}>
                  <TimeAgo date={invitation.createdAt} length="long" />
                </span>
              </>
            ),
          }}
          thumb={
            <GroupAvatar
              id={invitation.group.id}
              name={invitation.group.name}
              sx={mediaCellStyles.avatar}
            />
          }
          title={
            <Link
              params={{ groupId: invitation.group.id }}
              title={invitation.group.name}
              to="/groups/$groupId"
              {...stylex.props(mediaCellStyles.title)}
            >
              {invitation.group.name}
            </Link>
          }
        />
      </CatalogCell>
      <CatalogCell column="inviter">{inviter}</CatalogCell>
      <CatalogCell column="permissions">
        <div {...stylex.props(catalogStyles.inline)}>{permissions}</div>
      </CatalogCell>
      <CatalogCell column="date" sx={catalogStyles.muted}>
        <TimeAgo date={invitation.createdAt} length="long" />
      </CatalogCell>
      <CatalogCell column="actions">
        <RowActions actions={actions} label={m.catalog_actions({ name: invitation.group.name })} />
      </CatalogCell>
    </TableRow>
  )
}
