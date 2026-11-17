import * as stylex from "@stylexjs/stylex"
import { ExternalLink, Key, Undo, User } from "@taiyomoe/ui/components/icons"
import { TableRow } from "@taiyomoe/ui/components/ui/table"
import { Link } from "@tanstack/react-router"
import type { RowAction } from "@/features/catalog/components/shared/row-actions"
import type { Selection } from "@/features/catalog/hooks/use-selection"
import type { GroupInvitation } from "@/features/groups/api/groups"
import { TimeAgo } from "@/components/time/time-ago"
import { UserLink } from "@/components/user-name/user-link"
import { CatalogCell, CatalogSelectCell } from "@/features/catalog/components/shared/catalog-table"
import { Folded, mediaCellStyles, TitleCell } from "@/features/catalog/components/shared/media-cell"
import { RowActions } from "@/features/catalog/components/shared/row-actions"
import { catalogStyles } from "@/features/catalog/lib/catalog-styles"
import { Uploader } from "@/features/chapters/components/uploader"
import { PersonAvatar } from "@/features/groups/components/group-avatar"
import { PermissionPills } from "@/features/groups/components/permission-pills"
import { m } from "@/paraglide/messages"

export function PendingInvitationRow({
  invitation,
  canCancel,
  selection,
  onDetails,
  onCancel,
}: {
  invitation: GroupInvitation
  canCancel: boolean
  selection: Selection
  onDetails: () => void
  onCancel: () => void
}) {
  const inviter = (
    <Uploader
      title={m.invitation_invited_by({ name: invitation.inviter.displayUsername })}
      uploader={invitation.inviter}
    />
  )
  const actions: RowAction[] = [
    { key: "details", label: m.invitation_see_grants(), icon: Key, onClick: onDetails },
    {
      key: "invitee",
      label: m.invitation_view_invitee(),
      icon: ExternalLink,
      render: <Link params={{ username: invitation.invitee.username }} to="/users/$username" />,
    },
    {
      key: "inviter",
      label: m.invitation_view_sender(),
      icon: User,
      render: <Link params={{ username: invitation.inviter.username }} to="/users/$username" />,
    },
    ...(canCancel
      ? [
          {
            key: "cancel",
            label: m.invitation_cancel(),
            icon: Undo,
            destructive: true,
            onClick: onCancel,
          },
        ]
      : []),
  ]

  return (
    <TableRow>
      <CatalogSelectCell
        disabled={!canCancel}
        id={invitation.id}
        label={invitation.invitee.displayUsername}
        selection={selection}
      />
      <CatalogCell column="invitee">
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
          thumb={<PersonAvatar person={invitation.invitee} sx={mediaCellStyles.avatar} />}
          title={<UserLink sx={mediaCellStyles.title} user={invitation.invitee} />}
        />
      </CatalogCell>
      <CatalogCell column="inviter">{inviter}</CatalogCell>
      <CatalogCell column="permissions">
        <div {...stylex.props(catalogStyles.inline)}>
          <PermissionPills permissions={invitation.permissions} />
        </div>
      </CatalogCell>
      <CatalogCell column="date" sx={catalogStyles.muted}>
        <TimeAgo date={invitation.createdAt} length="long" />
      </CatalogCell>
      <CatalogCell column="actions">
        <RowActions
          actions={actions}
          label={m.catalog_actions({ name: invitation.invitee.displayUsername })}
        />
      </CatalogCell>
    </TableRow>
  )
}
