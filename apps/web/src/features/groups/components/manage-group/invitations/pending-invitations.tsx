import type { Permissions } from "@taiyomoe/permissions"
import * as stylex from "@stylexjs/stylex"
import { Mail, Undo } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import type { GroupInvitation } from "@/features/groups/api/groups"
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog"
import { DashboardSection } from "@/components/layout/dashboard-page"
import { TimeAgo } from "@/components/time/time-ago"
import { renderWithName } from "@/components/user-name/with-name"
import { BulkBar } from "@/features/catalog/components/shared/bulk-bar"
import {
  SkeletonActions,
  SkeletonMediaCell,
  SkeletonPill,
  SkeletonText,
  SkeletonUsers,
} from "@/features/catalog/components/shared/catalog-skeletons"
import {
  CatalogFooter,
  CatalogTable,
  VisuallyHidden,
} from "@/features/catalog/components/shared/catalog-table"
import { useSelection } from "@/features/catalog/hooks/use-selection"
import { catalogStyles } from "@/features/catalog/lib/catalog-styles"
import { formatNumber } from "@/features/dashboard/lib/format"
import {
  groupInvitationsQueryOptions,
  useCancelGroupInvitations,
} from "@/features/groups/api/groups"
import { DetailDialog } from "@/features/groups/components/detail-dialog"
import { InvitationGrants } from "@/features/groups/components/invitations/invitation-grants"
import { PendingInvitationRow } from "@/features/groups/components/manage-group/invitations/pending-invitation-row"
import { toastGroupsResult } from "@/features/groups/lib/group-bulk-toast"
import { groupTableStyles } from "@/features/groups/lib/group-table-styles"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

type InvitationDialog = {
  kind: "details" | "cancel"
  invitations: GroupInvitation[]
  /** Opened from the selection, which clears once the action succeeds. */
  bulk: boolean
}

const SKIP_REASONS = { NOT_PENDING: m.invitation_skipped_answered }
const styles = stylex.create({
  expiry: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: "0.8125rem",
  },
})

export function PendingInvitations({
  groupId,
  userId,
  can,
}: {
  groupId: string
  userId: string
  can: Permissions
}) {
  const { data: invitations } = useQuery(groupInvitationsQueryOptions(groupId))
  const cancel = useCancelGroupInvitations(groupId)
  const canCancel = (invitation: GroupInvitation) =>
    invitation.inviter.id === userId ||
    can("group.inviteMember", { groupId, permissions: invitation.permissions })
  const selection = useSelection(
    invitations?.filter(canCancel).map((invitation) => invitation.id) ?? [],
  )
  const [dialog, setDialog] = useState<InvitationDialog | null>(null)
  const [first] = dialog?.invitations ?? []
  const shown = dialog?.kind === "details" ? first : undefined
  const cancelling = dialog?.kind === "cancel" ? dialog.invitations : null

  return (
    <DashboardSection title={m.invitations_pending()}>
      <CatalogTable
        bulkBar={
          <BulkBar count={selection.ids.length} onClear={selection.clear}>
            <Button
              onClick={() => {
                setDialog({
                  kind: "cancel",
                  invitations: invitations?.filter((item) => selection.has(item.id)) ?? [],
                  bulk: true,
                })
              }}
              variant="destructive-outline"
            >
              <Undo />
              {m.invitation_cancel()}
            </Button>
          </BulkBar>
        }
        columns={[
          {
            key: "invitee",
            label: m.invitations_column_invitee(),
            skeleton: (
              <SkeletonMediaCell narrow={{ from: "4xl", content: "pills" }} thumb="avatar" />
            ),
          },
          {
            key: "inviter",
            label: m.invitation_column_inviter(),
            width: catalogStyles.colWide,
            from: "3xl",
            skeleton: <SkeletonUsers />,
          },
          {
            key: "permissions",
            label: m.invitation_column_permissions(),
            width: groupTableStyles.colPermissions,
            from: "3xl",
            skeleton: <SkeletonPill width="6.5rem" />,
          },
          {
            key: "date",
            label: m.group_requests_column_sent(),
            width: catalogStyles.colMedium,
            from: "4xl",
            skeleton: <SkeletonText width="5.5rem" />,
          },
          {
            key: "actions",
            label: <VisuallyHidden>{m.catalog_column_actions()}</VisuallyHidden>,
            width: catalogStyles.colActions,
            skeleton: <SkeletonActions />,
          },
        ]}
        empty={
          invitations?.length === 0
            ? {
                icon: Mail,
                title: m.invitations_pending_empty_title(),
                description: m.invitations_pending_empty_description(),
              }
            : null
        }
        footer={
          invitations === undefined ? null : (
            <CatalogFooter total={m.catalog_results({ count: formatNumber(invitations.length) })}>
              {null}
            </CatalogFooter>
          )
        }
        loading={invitations === undefined}
        selection={selection}
        toolbar={null}
      >
        {invitations?.map((invitation) => (
          <PendingInvitationRow
            canCancel={canCancel(invitation)}
            invitation={invitation}
            key={invitation.id}
            onCancel={() => {
              setDialog({ kind: "cancel", invitations: [invitation], bulk: false })
            }}
            onDetails={() => {
              setDialog({ kind: "details", invitations: [invitation], bulk: false })
            }}
            selection={selection}
          />
        ))}
      </CatalogTable>
      <DetailDialog
        footer={
          shown !== undefined && canCancel(shown) ? (
            <Button
              onClick={() => {
                setDialog({ kind: "cancel", invitations: [shown], bulk: false })
              }}
              variant="destructive-outline"
            >
              {m.invitation_cancel()}
            </Button>
          ) : null
        }
        meta={
          shown === undefined ? null : (
            <>
              {renderWithName(m.invitation_invited_by, shown.inviter)}
              <span aria-hidden>·</span>
              <TimeAgo date={shown.createdAt} length="long" />
            </>
          )
        }
        onClose={() => {
          setDialog(null)
        }}
        open={shown !== undefined}
        title={shown === undefined ? null : renderWithName(m.invitation_sent_title, shown.invitee)}
      >
        {shown === undefined ? null : (
          <>
            <InvitationGrants
              empty={m.invitation_grants_them_nothing()}
              permissions={shown.permissions}
              title={m.invitation_grants_them()}
            />
            <p sx={styles.expiry}>
              {m.invitation_expires()} <TimeAgo date={shown.expiresAt} future length="long" />
            </p>
          </>
        )}
      </DetailDialog>
      <ConfirmDialog
        confirmation={
          cancelling === null || first === undefined
            ? null
            : {
                title:
                  cancelling.length === 1
                    ? renderWithName(m.invitation_cancel_title, first.invitee)
                    : m.invitation_bulk_cancel_title({ count: cancelling.length }),
                description: m.invitation_cancel_description(),
                confirmLabel: m.invitation_cancel(),
                destructive: true,
                run: () =>
                  cancel
                    .mutateAsync(cancelling.map((invitation) => invitation.id))
                    .then((result) => {
                      toastGroupsResult(
                        result,
                        cancelling.length === 1
                          ? () => m.invitation_cancelled({ name: first.invitee.displayUsername })
                          : m.invitation_bulk_cancelled,
                        SKIP_REASONS,
                      )

                      if (dialog?.bulk === true) {
                        selection.clear()
                      }
                    }),
              }
        }
        error={cancel.isError ? getErrorMessage(cancel.error) : null}
        onClose={() => {
          setDialog(null)
          cancel.reset()
        }}
        pending={cancel.isPending}
      />
    </DashboardSection>
  )
}
